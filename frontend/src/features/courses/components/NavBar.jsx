export default function NavBar() {
    return (
        <nav className="bg-[#101f3f] p-4 text-white">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-lg font-bold"><a href="/courses">Study Circle</a></div>
                <div>
                    <a href="" className="px-3 hover:underline">Sign In</a>
                    <a href="" className="px-3 hover:underline">Sign Up</a>
                </div>
            </div>
        </nav>
    );
}
