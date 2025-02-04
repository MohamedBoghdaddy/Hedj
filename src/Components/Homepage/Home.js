import HeroSection from "./HeroSection";
import StorytellingSection from "./StorytellingSection";
import CallToActionSection from "./CallToActionSection";
import VirtualShowroomSection from "./VirtualShowroomSection";
import ContactInfoSection from "./ContactInfoSection";
import "../../Styles/Home.css";

const Home = () => {
  return (
    <div className="full-page">
      <HeroSection />
      <StorytellingSection />
      <CallToActionSection />
      <VirtualShowroomSection />
      <ContactInfoSection />
    </div>
  );
};

export default Home;
