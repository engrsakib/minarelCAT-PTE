import Title from "@/components/Reusable/Title";



export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
     
       {/* headding */}
       <div className="mt-[202px]">
        <Title heading="Ace Your PTE Core Exam" subheading="with AI-Powered Practice!" pragraph="Boost your scores with real-time AI scoring, mock tests!" />
       </div>



    </div>
  );
}
