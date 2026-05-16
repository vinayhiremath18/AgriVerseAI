export async function POST(req: Request) {

    try {

        const body = await req.json();

        const image = body.image;

        if (!image) {

            return Response.json({
                disease: "No Image",
                confidence: "0%",
                treatment: "Upload crop image",
                fertilizer: "N/A",
            });

        }

        // SIMPLE FAKE VALIDATION

        const lowerImage = image.toLowerCase();

        // Detect likely non-crop uploads
        if (
            lowerImage.includes("person") ||
            lowerImage.includes("human") ||
            lowerImage.includes("face")
        ) {

            return Response.json({
                disease: "Invalid Image",
                confidence: "0%",
                treatment: "Please upload crop or leaf image",
                fertilizer: "N/A",
            });

        }

        const cropDiseases = [

            {
                disease: "Leaf Blight",
                confidence: "96%",
                treatment: "Mancozeb Spray",
                fertilizer: "NPK 19-19-19",
            },

            {
                disease: "Powdery Mildew",
                confidence: "92%",
                treatment: "Sulfur Fungicide",
                fertilizer: "DAP",
            },

            {
                disease: "Rust Disease",
                confidence: "95%",
                treatment: "Copper Oxychloride",
                fertilizer: "Organic Compost",
            },

            {
                disease: "Bacterial Spot",
                confidence: "91%",
                treatment: "Streptomycin Spray",
                fertilizer: "Vermicompost",
            },

            {
                disease: "Healthy Crop",
                confidence: "99%",
                treatment: "No Treatment Needed",
                fertilizer: "Maintain Current Nutrition",
            },

        ];

        const randomDisease =
            cropDiseases[
            Math.floor(Math.random() * cropDiseases.length)
            ];

        await new Promise((resolve) =>
            setTimeout(resolve, 2500)
        );

        return Response.json(randomDisease);

    } catch (error) {

        console.log(error);

        return Response.json({
            disease: "Detection Failed",
            confidence: "0%",
            treatment: "Retry Again",
            fertilizer: "Retry",
        });

    }

}