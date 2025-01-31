import style from "./Landing.module.scss";
import { Images } from "@/assets";
import { useEffect } from "react";
import AOS from "aos";
import { PricingSection, ReviewSection, FeatureSection } from "@/components";

function Landing() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
    });
  }, []);
  return (
    <div className={style.landingPage}>
      {/* Hero Section */}
      <section className={style.hero}>
        <div className={style.heroImage} style={{ backgroundImage: `url(${Images.background})` }}>
          <div className={style.heroContent} data-aos="fade-up">
            <h1 data-aos="fade-down">IPAS:</h1>
            <p className={style.text} data-aos="fade-up" data-aos-delay="200">
              Intelligent Pomelo
            </p>
            <p className={style.text} data-aos="fade-up" data-aos-delay="200">
              AgriSolutions
            </p>
            <hr className={style.horizoltal} data-aos="zoom-in" />
            <p className={style.smallText} data-aos="fade-up" data-aos-delay="200">
              Optimize crop care, streamline workforce management, and boost productivity
            </p>
            <p className={style.smallText} data-aos="fade-up" data-aos-delay="200">
              with AI-powered tools.
            </p>
            <a href="/" className={style.button_start} data-aos="zoom-in">
              Get Started Now
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeatureSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Review Section */}
      <ReviewSection />
    </div>
  );
}

export default Landing;
