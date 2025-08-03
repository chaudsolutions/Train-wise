const fs = require("fs");
const path = require("path");
const { uploadToS3, generateSignedUrl, deleteFromS3 } = require("./s3bucket");

// Test configuration
const testFileName = "test-image.jpg";
const testFilePath = path.join(__dirname, testFileName);
const testFileMimetype = "image/jpeg";

// Helper function to create a test buffer
async function getTestFileBuffer() {
    // Create a simple test file if it doesn't exist
    if (!fs.existsSync(testFilePath)) {
        // This would create a small red dot image
        const testImage = Buffer.from(
            "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==",
            "base64"
        );
        fs.writeFileSync(testFilePath, testImage);
    }
    return fs.readFileSync(testFilePath);
}

async function runTests() {
    try {
        console.log("Starting S3 service tests...");

        // 1. Test file upload
        console.log("\n1. Testing uploadToS3...");
        const testBuffer = await getTestFileBuffer();
        const uploadResult = await uploadToS3(
            testBuffer,
            testFileName,
            testFileMimetype
        );
        console.log("Upload successful:", {
            url: uploadResult.url,
            key: uploadResult.key,
        });

        // 2. Test signed URL generation
        console.log("\n2. Testing generateSignedUrl...");
        const signedUrl = await generateSignedUrl(uploadResult.key, 60); // 60 seconds expiry
        console.log("Signed URL:", signedUrl);

        // 3. Test file deletion
        console.log("\n3. Testing deleteFromS3...");
        await deleteFromS3(uploadResult.key);
        console.log("Deletion successful");

        console.log("\nAll tests completed successfully!");
    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        // Clean up test file
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
    }
}

module.exports = runTests;
