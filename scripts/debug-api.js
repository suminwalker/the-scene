
const API_KEY = process.env.GOOGLE_API_KEY;

async function testFetch() {
    const query = "cool bars in New York City, NY";
    console.log(`Testing Query: ${query}`);
    console.log(`Key: ${API_KEY ? "Present" : "Missing"}`);

    try {
        const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": API_KEY,
                "X-Goog-FieldMask": "*" // Request all fields to debug
            },
            body: JSON.stringify({
                textQuery: query,
                pageSize: 1
            })
        });

        console.log(`Response Status: ${response.status}`);
        const text = await response.text();
        console.log("Body:", text);

    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

testFetch();
