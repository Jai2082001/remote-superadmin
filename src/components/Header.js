import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-indigo-900 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-extrabold cursor-pointer hover:text-indigo-200 transition-colors duration-300">
          <Link href="/" passHref>
            <span>Super Admin Portal</span>
          </Link>
        </h1>
        <nav>
          <ul className="flex space-x-8 text-lg font-semibold">
            <li>
              <Link href="/" passHref>
                <span className="cursor-pointer hover:text-indigo-200 transition-colors duration-300">Create Restaurant</span>
              </Link>
            </li>
            <li>
              <Link href="/restaurants" passHref>
                <span className="cursor-pointer hover:text-indigo-200 transition-colors duration-300">Restaurant List</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
