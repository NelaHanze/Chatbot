document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submit').addEventListener('click', sendMessageToAssistant);
});

async function sendMessageToAssistant() {
    const apiKey = document.getElementById('api-key-input').value;
    const userInput = document.getElementById('user-input').value;

    if (!apiKey.trim() || !userInput.trim()) {
        alert('API key and input from user are required.');
        return;
    }

    // Pridanie užívateľskej správy do histórie konverzácie
    addMessageToConversation("Vy: " + userInput, "user");

    // Najprv skúste nájsť odpoveď na serveri
    const localResponse = await searchMarkdownContent(userInput);
    if (localResponse) {
        // Ak server nájde odpoveď, zobrazte ju
        addMessageToConversation("Asistent: " + localResponse, "assistant");
    } else {
        // Ak server nenájde odpoveď, pošlite otázku na OpenAI API
        try {
            const response = await fetch("https://api.openai.com/v1/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    prompt: userInput,
                    temperature: 0.5,
                    max_tokens: 200
                })
            });

            const data = await response.json();
            const assistantResponse = data.choices && data.choices.length > 0 ? data.choices[0].text.trim() : "Nemám odpoveď.";
            addMessageToConversation("Asistent: " + assistantResponse, "assistant");
        } catch (error) {
            console.error("Error:", error);
            addMessageToConversation("Asistent: Prepáčte, vyskytla sa chyba pri spracovaní vašej požiadavky.", "assistant");
        }
    }
    document.getElementById('user-input').value = ''; // Vymazanie vstupného poľa
}

function addMessageToConversation(message, sender) {
    const fullConversation = document.getElementById('full-conversation');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    if (sender === "assistant") {
        messageElement.style.fontWeight = "bold";
    }
    fullConversation.appendChild(messageElement);
    fullConversation.scrollTop = fullConversation.scrollHeight; // Scroll to the bottom
}

async function searchMarkdownContent(query) {
    try {
        const response = await fetch('http://localhost:3000/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: query })
        });
        if (!response.ok) {
            throw new Error('Server response was not OK.');
        }
        return await response.text(); // Alebo response.json(), ak očakávate, že odpoveď bude vo formáte JSON
    } catch (error) {
        console.error('Search request failed:', error);
        return null;
    }
}
