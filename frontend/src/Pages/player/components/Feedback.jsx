export default function Feedback() {
    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Please tell us what do you think, any kind of feedback is highly appreciated. 🤗</h2>
            <textarea
                className="w-full h-32 border border-[#E3E8E6] rounded-md p-3"
                placeholder="Write your feedback..."
            />
            <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md">
                Submit
            </button>
        </div>
    );
}