import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default async function EventDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // 1. Obtener el slug de la URL
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // 2. Buscar el evento específico en Supabase
  const { data: event, error } = await supabase
    .from("events")
    .select(`
      *,
      tenants (
        name,
        theme_color
      )
    `)
    .eq("slug", slug)
    .single();

  // 3. Mostrar pantalla de error si el evento no existe
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-purple-500">Quest Not Found</h1>
        <p className="text-gray-400 mb-8">The tournament you are looking for does not exist or has ended.</p>
        <Link href="/" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded transition-colors">
          &larr; Return to Arena
        </Link>
      </div>
    );
  }

  const displayEvent = event as any;
  const formattedDate = new Date(displayEvent.event_date).toLocaleDateString("en-US", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 4. Mostrar los detalles del evento
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <div 
        className="h-64 md:h-96 w-full bg-cover bg-center relative border-b border-purple-500/30"
        style={{ backgroundImage: `url(${displayEvent.image_url})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/80 to-transparent flex flex-col justify-end p-8 md:p-16">
          <div className="max-w-4xl mx-auto w-full">
            <span className="bg-purple-500/20 text-purple-400 border border-purple-500/50 text-sm font-bold px-3 py-1 rounded-full mb-4 inline-block">
              {displayEvent.status}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-2">{displayEvent.title}</h1>
            <p className="text-xl text-gray-300">Hosted by {displayEvent.tenants?.name}</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto p-8 md:p-8">
        <Link href="/" className="text-gray-400 hover:text-purple-400 mb-8 inline-block transition-colors font-medium">
          &larr; Back to Events
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content Info */}
          <div className="md:col-span-2 space-y-8">
            <section className="bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 border-b border-gray-800 pb-4 text-purple-400">
                Quest Details
              </h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {displayEvent.description}
              </p>
              <div className="mt-8 p-4 bg-gray-950 rounded-lg border border-gray-800">
                <p className="text-gray-400 text-sm italic">
                  Webhook integrations and live bracket statistics will be displayed here soon.
                </p>
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg sticky top-8">
              <h3 className="text-lg font-bold text-gray-400 mb-6 uppercase tracking-wider border-b border-gray-800 pb-2">
                Tournament Info
              </h3>
              <ul className="space-y-6">
                <li>
                  <p className="text-sm text-gray-500 mb-1">Schedule</p>
                  <p className="font-semibold text-gray-200">{formattedDate}</p>
                </li>
                <li>
                  <p className="text-sm text-gray-500 mb-1">Prize Pool</p>
                  <p className="font-bold text-green-400 text-2xl drop-shadow-[0_0_8px_rgba(74,222,128,0.3)]">
                    {displayEvent.prize_pool}
                  </p>
                </li>
              </ul>
              <button className="w-full mt-8 bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                Awaken & Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}