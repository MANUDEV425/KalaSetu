import MobileArtisanNav from '../components/MobileArtisanNav';

export default function PlaceholderPage({
  title,
  description,
  icon,
}) {
  return (
    <div className="min-h-screen bg-kala-50 pb-20 md:pb-0">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        <div className="bg-white rounded-2xl border border-kala-100 shadow-sm p-8 sm:p-12 text-center">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-kala-50 flex items-center justify-center text-3xl mb-5">
            {icon}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-kala-700">
            {title}
          </h1>

          <p className="max-w-lg mx-auto text-gray-500 mt-3">
            {description}
          </p>

          <div className="mt-7 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 text-sm text-gray-500">
            <span>🚧</span>
            <span>Coming in a later phase</span>
          </div>

        </div>

      </div>

      <MobileArtisanNav />

    </div>
  );
}