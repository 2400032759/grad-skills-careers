import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import JobListing from '@/components/JobListing';
import Footer from '@/components/Footer';

export default function Home() {
   return (
      <main className="min-h-screen">
         <Navbar />
         <HeroSection />

         <div className="bg-slate-50 py-8 md:py-24">
            <div className="max-container grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 text-center md:text-left">
               <div className="space-y-2 md:space-y-4">
                  <div className="w-16 h-16 bg-white rounded-3xl shadow-premium flex items-center justify-center text-brand-red mx-auto md:mx-0">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h3 className="font-lexend font-bold text-2xl text-gray-900 leading-tight">Fast Paced</h3>
                  <p className="text-gray-600 font-medium tracking-tight">Join the team that builds and delivers features at incredible speed.</p>
               </div>
               <div className="space-y-2 md:space-y-4">
                  <div className="w-16 h-16 bg-white rounded-3xl shadow-premium flex items-center justify-center text-brand-purple mx-auto md:mx-0">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                  <h3 className="font-lexend font-bold text-2xl text-gray-900 leading-tight">Impact First</h3>
                  <p className="text-gray-600 font-medium tracking-tight">Work on projects that directly impact the careers of thousands.</p>
               </div>
               <div className="space-y-2 md:space-y-4">
                  <div className="w-16 h-16 bg-white rounded-3xl shadow-premium flex items-center justify-center text-blue-500 mx-auto md:mx-0">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  </div>
                  <h3 className="font-lexend font-bold text-2xl text-gray-900 leading-tight">Learning Mindset</h3>
                  <p className="text-gray-600 font-medium tracking-tight">We invest in our team's growth as much as our student's.</p>
               </div>
            </div>
         </div>

         <JobListing
            limit={3}
            hideFilters={true}
            title="Featured Openings"
            subtitle="The latest roles to join our fast-growing team."
         />
         <Footer />
      </main>
   );
}
