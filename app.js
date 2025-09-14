import React, { useState, useEffect, useRef } from 'react';

// Main App Component
const App = () => {
    // --- STATE MANAGEMENT ---
    const [ingredients, setIngredients] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [generatedRecipes, setGeneratedRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [inputType, setInputType] = useState('text'); // 'text' or 'image'

    const recognitionRef = useRef(null);
    const recipesEndRef = useRef(null);
    const mainFormRef = useRef(null);

    // --- ICONS ---
    const LogoIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
            <path d="M5.5 13.5A2.5 2.5 0 0 1 8 11h8a2.5 2.5 0 0 1 2.5 2.5v3.5a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-3.5Z" />
            <path d="M8 11V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
            <path d="m6 11-1-1" />
            <path d="m18 11 1-1" />
        </svg>
    );
    const MicIcon = ({ isListening }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-all duration-300 ${isListening ? 'text-emerald-500 scale-110' : 'text-gray-400'}`}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>;
    const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-[#EA580C] transition-colors"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>;
    const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M19 17v4M17 19h4M12 3l1.9 5.8L19.7 11l-5.8 1.9L12 18.7l-1.9-5.8L4.3 11l5.8-1.9L12 3z" /></svg>;
    const Step1Icon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
    const Step2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
    const Step3Icon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M19 17v4M17 19h4M12 3l1.9 5.8L19.7 11l-5.8 1.9L12 18.7l-1.9-5.8L4.3 11l5.8-1.9L12 3z" /></svg>;

    // --- CUSTOM LOADING SPINNER ---
    const CookingSpinner = () => (
        <div className="relative w-24 h-24">
            <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                <circle className="text-gray-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                <circle className="text-[#EA580C] animate-chef-spin" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="188.4" strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
            </svg>
             <div className="absolute inset-0 flex items-center justify-center text-[#EA580C] text-3xl animate-bounce">🔥</div>
        </div>
    );

    // --- SPEECH RECOGNITION & HOOKS (logic unchanged) ---
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => { setError('Speech recognition failed.'); setIsListening(false); };
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results).map(result => result[0].transcript).join('');
            setIngredients(transcript);
        };
        recognitionRef.current = recognition;
    }, []);

    useEffect(() => {
        if (generatedRecipes.length > 0) {
            recipesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [generatedRecipes]);

    // --- HANDLERS ---
    const handleInputChange = (e) => setIngredients(e.target.value);
    const handleVoiceInput = () => {
        if (isListening) recognitionRef.current.stop();
        else recognitionRef.current.start();
    };
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result.split(',')[1]);
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleGenerateRecipes = async () => {
        if (inputType === 'text' && !ingredients) {
            setError('Please enter some ingredients.');
            return;
        }
        if (inputType === 'image' && !uploadedImage) {
            setError('Please upload an image.');
            return;
        }
        setError('');
        setIsLoading(true);
        setGeneratedRecipes([]);
        try {
            const currentIngredients = inputType === 'text' ? ingredients : null;
            const currentImage = inputType === 'image' ? uploadedImage : null;
            const response = await callGeminiAPI(currentIngredients, currentImage);
            setGeneratedRecipes([response]); 
        } catch (err) {
            setError('Failed to generate recipe. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

     const handleScrollToForm = () => {
        mainFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    // --- API CALL TO GEMINI (logic unchanged) ---
    const callGeminiAPI = async (ingredients, imageBase64) => {
        const apiKey = "";
        try {
            const textApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const textParts = [];
            if (imageBase64) {
                 textParts.push({ text: "Analyze this image and generate a recipe using only the visible ingredients. Write everything in simple English. Provide a fun, creative name, a list of ingredients with measurements, and easy-to-follow cooking steps." });
                 textParts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64 } });
            } else {
                 textParts.push({ text: `Using only these ingredients: ${ingredients}, create a recipe in simple English. Give it a fun, creative name, a list of the ingredients with measurements, and easy-to-follow cooking steps.` });
            }
            const textPayload = { contents: [{ parts: textParts }], generationConfig: { responseMimeType: "application/json", responseSchema: { type: "OBJECT", properties: { recipeName: { type: "STRING" }, ingredients: { type: "ARRAY", items: { type: "STRING" } }, instructions: { type: "ARRAY", items: { type: "STRING" } } }, required: ["recipeName", "ingredients", "instructions"] } } };
            const textResponse = await fetch(textApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(textPayload) });
            if (!textResponse.ok) throw new Error("Text API failed");
            const textResult = await textResponse.json();
            const recipeData = JSON.parse(textResult.candidates[0].content.parts[0].text);
            const imageApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
            const imagePrompt = `A delicious, professional food photograph of ${recipeData.recipeName}, clean background, editorial style.`;
            const imagePayload = { instances: [{ prompt: imagePrompt }], parameters: { "sampleCount": 1 } };
            const imageResponse = await fetch(imageApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(imagePayload) });
            if (!imageResponse.ok) throw new Error("Image API failed");
            const imageResult = await imageResponse.json();
            const imageUrl = `data:image/png;base64,${imageResult.predictions[0].bytesBase64Encoded}`;
            return { ...recipeData, imageUrl };
        } catch (error) { throw error; }
    };

    // --- RENDER ---
    return (
        <div className="min-h-screen bg-[#F9F6F2] font-sans text-gray-800 antialiased">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap');
                .font-serif { font-family: 'Playfair Display', serif; }
                .font-sans { font-family: 'Inter', sans-serif; }
                .animate-chef-spin { animation: chef-spin 1.5s ease-in-out infinite; }
                @keyframes chef-spin {
                    0% { stroke-dashoffset: 251.2; transform: rotate(0deg); }
                    50% { stroke-dashoffset: 62.8; transform: rotate(720deg); }
                    100% { stroke-dashoffset: 251.2; transform: rotate(1080deg); }
                }
                .bg-pattern {
                    background-image: url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23EA580C" fill-opacity="0.04"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');
                }
            `}</style>

            <div className="bg-pattern min-h-screen">
                <div className="max-w-6xl mx-auto p-4 md:p-8">
                    <header className="flex justify-center items-center py-6 relative">
                        <nav className="hidden md:flex items-center gap-6 absolute left-8">
                             <a href="#" className="font-semibold text-gray-600 hover:text-[#EA580C]">Inspiration</a>
                             <a href="#" className="font-semibold text-gray-600 hover:text-[#EA580C]">About</a>
                        </nav>
                        <div className="flex items-center gap-3">
                            <LogoIcon />
                            <h1 className="text-3xl font-serif font-bold tracking-wider text-gray-800">Recipe Pro</h1>
                        </div>
                         <nav className="hidden md:flex items-center gap-6 absolute right-8">
                             <a href="#" className="font-semibold text-gray-600 hover:text-[#EA580C]">My Recipes</a>
                             <a href="#" className="font-semibold text-gray-600 hover:text-[#EA580C]">Login</a>
                        </nav>
                    </header>
                    
                    <main>
                         <section className="text-center my-16 md:my-24">
                            <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 leading-tight">What's in Your Kitchen Today?</h2>
                            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Let our AI turn your available ingredients into a delightful meal.</p>
                             <button onClick={handleScrollToForm} className="mt-8 px-8 py-3 bg-[#EA580C] text-white font-bold rounded-full hover:bg-[#C2410C] transition-all transform hover:scale-105">
                                Start Cooking
                            </button>
                        </section>

                        <section ref={mainFormRef} className="my-16 md:my-24 pt-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200">
                            <div className="text-center mb-10">
                                <h3 className="text-3xl font-serif font-bold">Generate Your Recipe</h3>
                                <p className="mt-2 text-gray-600">Choose your preferred method below.</p>
                            </div>
                            <div className="max-w-2xl mx-auto p-6 md:p-8">
                                 <div className="flex border-b border-gray-200">
                                    <button onClick={() => setInputType('text')} className={`py-3 px-6 text-sm font-semibold transition-colors ${inputType === 'text' ? 'text-[#EA580C] border-b-2 border-[#EA580C]' : 'text-gray-500'}`}>By Ingredients</button>
                                    <button onClick={() => setInputType('image')} className={`py-3 px-6 text-sm font-semibold transition-colors ${inputType === 'image' ? 'text-[#EA580C] border-b-2 border-[#EA580C]' : 'text-gray-500'}`}>By Photo</button>
                                </div>
                                
                                <div className="py-6">
                                    {inputType === 'text' ? (
                                        <div className="relative animate-fade-in-fast">
                                            <textarea value={ingredients} onChange={handleInputChange} placeholder="e.g., chicken breast, cherry tomatoes, olive oil, garlic, rosemary..." className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition h-28 resize-none" disabled={isLoading} />
                                            <button onClick={handleVoiceInput} className="absolute right-3 bottom-3 p-2 rounded-full hover:bg-gray-100" title="Speak ingredients"><MicIcon isListening={isListening} /></button>
                                        </div>
                                    ) : (
                                         <div className="animate-fade-in-fast">{!imagePreview ? (<label htmlFor="image-upload" className="group cursor-pointer w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-2xl transition-colors hover:border-[#EA580C]"><CameraIcon /><span className="mt-2 text-gray-500 group-hover:text-[#EA580C] transition-colors">Click to upload or drag & drop</span><input id="image-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/png, image/jpeg" disabled={isLoading} /></label>) : (<div className="relative w-full text-center"><img src={imagePreview} alt="Preview" className="w-full max-h-60 object-contain rounded-xl" /><button onClick={() => {setImagePreview(''); setUploadedImage(null)}} className="mt-2 text-sm text-gray-500 hover:text-red-500">Clear Image</button></div>)}</div>
                                    )}
                                </div>
                                <button onClick={handleGenerateRecipes} className="w-full flex items-center justify-center gap-3 py-4 bg-[#EA580C] text-white font-bold rounded-lg hover:bg-[#C2410C] transition-all transform hover:scale-105 disabled:bg-orange-200" disabled={isLoading}><SparklesIcon />{isLoading ? 'Creating...' : 'Generate Recipe'}</button>
                            </div>
                        </section>

                        {error && <p className="text-center text-red-500 my-6 animate-fade-in">{error}</p>}
                        {isLoading && <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"><CookingSpinner /><p className="mt-6 font-semibold text-gray-600">Whipping something up...</p></div>}
                        
                        {generatedRecipes.length > 0 && (
                            <section ref={recipesEndRef} className="my-16 md:my-24">
                               {generatedRecipes.map((recipe, index) => (
                                   <div key={index} className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up-fade border border-gray-100">
                                        <div className="grid md:grid-cols-5 gap-0">
                                            <div className="md:col-span-2"><img src={recipe.imageUrl || "https://placehold.co/600x800/FFF7ED/C2410C?text=Yummy!"} alt={recipe.recipeName} className="w-full h-full object-cover min-h-[300px]" /></div>
                                            <div className="md:col-span-3 p-8 md:p-12">
                                                <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-6">{recipe.recipeName}</h2>
                                                <div className="mb-8"><h3 className="text-xl font-serif font-bold text-gray-700 mb-3">Ingredients</h3><ul className="space-y-2 text-gray-600 list-disc list-inside">{recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul></div>
                                                <div><h3 className="text-xl font-serif font-bold text-gray-700 mb-4">Instructions</h3><ol className="space-y-5 text-gray-600">{recipe.instructions.map((step, i) => (<li key={i} className="flex items-start"><span className="flex-shrink-0 flex items-center justify-center w-7 h-7 bg-[#FFEDD5] text-[#C2410C] text-sm font-bold rounded-full mr-4">{i + 1}</span><span className="flex-1 leading-relaxed">{step}</span></li>))}</ol></div>
                                            </div>
                                        </div>
                                   </div>
                               ))}
                            </section>
                        )}

                        <section className="my-16 md:my-24 text-center">
                            <h3 className="text-3xl font-serif font-bold text-center mb-12">How It Works</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                <div className="flex flex-col items-center">
                                    <div className="bg-orange-100 p-4 rounded-full text-orange-600 mb-4"><Step1Icon /></div>
                                    <h4 className="text-xl font-serif font-bold">1. Enter Ingredients</h4>
                                    <p className="text-gray-600 mt-2">Type or upload a photo of what you have in your pantry.</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="bg-orange-100 p-4 rounded-full text-orange-600 mb-4"><Step2Icon /></div>
                                    <h4 className="text-xl font-serif font-bold">2. Get AI Recipe</h4>
                                    <p className="text-gray-600 mt-2">Our smart AI instantly crafts a unique recipe just for you.</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="bg-orange-100 p-4 rounded-full text-orange-600 mb-4"><Step3Icon /></div>
                                    <h4 className="text-xl font-serif font-bold">3. Cook & Enjoy</h4>
                                    <p className="text-gray-600 mt-2">Follow the simple steps and enjoy your delicious meal.</p>
                                </div>
                            </div>
                        </section>
                    </main>

                    <footer className="text-center py-12 border-t border-gray-200 mt-12">
                        <p className="text-gray-600">&copy; 2025 Recipe Pro. All Rights Reserved.</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default App;



