import Banner from "@/components/home/Banner";
import Platform from "@/components/home/Platform";
import Title from "@/components/Reusable/Title";

export default function Home() {
  return (
    <div className="max-w-full items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      {/* headding */}
      <div className="mt-[202px]">
        <Title
          heading="Ace Your PTE Core Exam"
          subheading="with AI-Powered Practice!"
          pragraph="Boost your scores with real-time AI scoring, mock tests!"
        />
      </div>

      {/* banner */}
      <section>
        <Banner />
      </section>

      {/* platform */}
      <section>
        <Platform />
      </section>
    </div>
  );
}
