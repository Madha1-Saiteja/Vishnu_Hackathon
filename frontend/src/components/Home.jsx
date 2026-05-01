import React, { useEffect, useRef, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import img1 from '../assets/vids/img1.jpg'
import img2 from '../assets/vids/img2.jpg'
import img3 from '../assets/vids/img3.jpg'
import img4 from '../assets/vids/img4.jpg'
import img5 from '../assets/vids/img5.jpg'
// import { Canvas, useFrame, useLoader } from '@react-three/fiber';
// import { OrbitControls } from '@react-three/drei';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import Header from "./Header";
// import Footer from './Footer';
import {
  FaMicrophone,
  FaRobot,
  FaHeartbeat,
  FaShieldAlt,
  FaStethoscope,
  FaQuoteLeft,
} from 'react-icons/fa';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/* =====================================================================
   ERROR BOUNDARY COMPONENT
   ===================================================================== */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8">
          <h2>Something went wrong.</h2>
          <p>Please refresh the page or try again later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

/* =====================================================================
   HEADER COMPONENT
   ===================================================================== */

/* =====================================================================
   HERO SECTION
   ===================================================================== */
   function HumanHeart2D() {
    const heartRef = useRef(null);
  
    useEffect(() => {
      // Pulsing animation: scale up and down continuously.
      gsap.to(heartRef.current, {
        scale: 1.2,
        duration: 0.5,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: -1,
        transformOrigin: '50% 50%',
      });
    }, []);
  
    return (
      <div className="absolute inset-0 flex justify-center items-center">
        <img
          ref={heartRef}
          src="../src/assets/heart1.png"  // Replace with your actual SVG file path
          // src="../src/assets/heart2.png"  // Replace with your actual SVG file path
          // src="../src/assets/heart3.png"  // Replace with your actual SVG file path
          alt="Human Heart"
          className="w-50 h-50"
        />
      </div>
    );
  }
  
  /**
   * HeroSection Component
   * Displays the hero section with the animated human heart in the background and overlay content.
   */




function HeroSection() {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative h-screen flex flex-col justify-center items-center bg-gradient-to-br from-red-500 to-white text-center px-6"
    >
      {/* 2D Human Heart Animation */}
      <HumanHeart2D />

      {/* Overlay Content */}
      <div className="relative z-10 max-w-2xl">
        <h2 className="text-6xl font-bold text-white">
          Automating Surgical Documentation
        </h2>
        <p className="text-2xl text-white mt-4">
          Leveraging AI, NLP, and immersive tech to revolutionize the OR.
        </p>
        <button
          onClick={scrollToFeatures}
          className="mt-8 px-8 py-4 bg-white text-red-600 font-bold rounded-full shadow-lg cursor-pointer"
        >
          Learn More
        </button>
      </div>
    </section>
  );
}

/* =====================================================================
   FEATURES SECTION
   ===================================================================== */
function FeaturesSection() {
  const features = [
    {
      icon: <FaMicrophone />,
      title: 'Speech-to-Text AI',
      description: 'Capture every detail with advanced voice recognition.',
    },
    {
      icon: <FaRobot />,
      title: 'NLP Integration',
      description: 'Context-aware analysis using natural language processing.',
    },
    {
      icon: <FaHeartbeat />,
      title: 'Real-Time Transcription',
      description: 'Document procedures as they happen, instantly.',
    },
    {
      icon: <FaShieldAlt />,
      title: 'Secure Data Management',
      description: 'HIPAA-compliant and fully secure data storage.',
    },
    {
      icon: <FaStethoscope />,
      title: 'Medical Insights',
      description: 'Gain actionable insights from procedure data.',
    },
  ];

  return (
    <section id="features" className="py-20 bg-white text-center">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold text-red-600 mb-12"
      >
        Features
      </motion.h2>
      <div className="grid md:grid-cols-3 gap-8 px-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="p-6 bg-gray-100 rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="text-5xl text-red-600 mb-4">{feature.icon}</div>
            <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


/* =====================================================================
   HOW IT WORKS SECTION
   ===================================================================== */
function HowItWorksSection() {
  const steps = [
    {
      title: 'Initiate Procedure',
      description: 'Start your surgery and let our system capture every word.',
    },
    {
      title: 'Real-Time Transcription',
      description: 'AI converts speech to text as the procedure unfolds.',
    },
    {
      title: 'Automated Documentation',
      description: 'Generate precise documentation instantly.',
    },
    {
      title: 'Secure Storage & Insights',
      description: 'Store data securely and analyze for improvements.',
    },
  ];

  return (
    <section id="howitworks" className="py-20 bg-gray-50 text-center">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold text-red-600 mb-12"
      >
        How It Works
      </motion.h2>
      <div className="max-w-4xl mx-auto px-4">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="mb-8 p-6 bg-white rounded-lg shadow-lg"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.3 }}
          >
            <h3 className="text-2xl font-bold text-red-600 mb-2">
              {index + 1}. {step.title}
            </h3>
            <p className="text-gray-700 text-lg">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

function MedicalCross(props) {
  const groupRef = useRef();

  // Rotate the cross continuously
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
      groupRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <group ref={groupRef} {...props}>
      {/* Vertical Bar */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 2, 0.6]} />
        <meshStandardMaterial color="#e3342f" />
      </mesh>
      {/* Horizontal Bar */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.6, 0.6]} />
        <meshStandardMaterial color="#e3342f" />
      </mesh>
    </group>
  );
}

function ThreeDSection() {
  return (
    <div className="w-64 h-64"> {/* Increased container size */}
      <Canvas shadows camera={{ position: [4, 4, 4], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        <MedicalCross position={[0, 0, 0]} />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}

/* =====================================================================
   TECHNOLOGY SECTION
   ===================================================================== */
function TechnologySection() {
  return (
    <section id="technology" className="py-20 bg-white text-center">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold text-red-600 mb-12"
      >
        Our Technology
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="max-w-3xl mx-auto text-xl text-gray-700 mb-8 px-4"
      >
        Our platform combines state-of-the-art speech recognition, natural language processing, and 3D visualization to ensure every surgical procedure is documented with surgical precision.
      </motion.p>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1 }}
        className="flex justify-center items-center"
      >
        <ThreeDSection />
      </motion.div>
    </section>
  );
}


/* =====================================================================
   TESTIMONIALS SECTION
   ===================================================================== */
function TestimonialsSection() {
  const testimonials = [
    '“MediDoc AI has revolutionized our surgical documentation – precise, fast, and incredibly intuitive.”',
    '“The integration of AI and 3D visualizations has set a new standard in medical documentation.”',
    '“I highly recommend MediDoc AI for its innovation and ease of use during surgeries.”',
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-red-500 to-white text-center">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold text-white mb-12"
      >
        What Medical Professionals Say
      </motion.h2>
      <motion.div
        key={current}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="max-w-2xl mx-auto text-white text-xl italic px-4"
      >
        <FaQuoteLeft className="text-3xl inline-block mb-4" />
        {testimonials[current]}
      </motion.div>
    </section>
  );
}

/* =====================================================================
   CONTACT SECTION
   ===================================================================== */
function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-white text-center">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold text-red-600 mb-12"
      >
        Get In Touch
      </motion.h2>
      <motion.form
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="max-w-md mx-auto px-4"
      >
        <div className="mb-4">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-4 border rounded-lg focus:outline-none focus:border-red-600"
          />
        </div>
        <div className="mb-4">
          <input
            type="email"
            placeholder="Your Email"
            className="w-full p-4 border rounded-lg focus:outline-none focus:border-red-600"
          />
        </div>
        <div className="mb-4">
          <textarea
            placeholder="Your Message"
            rows="4"
            className="w-full p-4 border rounded-lg focus:outline-none focus:border-red-600"
          ></textarea>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="w-full px-8 py-4 bg-red-600 text-white font-bold rounded-full shadow-lg"
        >
          Send Message
        </motion.button>
      </motion.form>
    </section>
  );
}

/* =====================================================================
   VIDEOS COMPONENT
   ===================================================================== */

   function Videos() {
    const videos = [
      {
        img: img1,
        link: "https://youtu.be/isYY2jvd8PU?feature=shared",
        title: "Live Surgery: Deep Brain Stimulation - Ryder P. Gwinn, MD"
      },
      {
        img: img2,
        link: "https://youtu.be/UvyLQYuave4?feature=shared",
        title: "Posterior thoracic scoliosis surgery side loading set 2017"
      },
      {
        img: img3,
        link: "https://youtu.be/2appWzVbAxw?feature=shared",
        title: "Brain tumor and awake brain surgery: Resection of metastatic melanoma"
      },
      {
        img: img4,
        link: "https://youtu.be/8hiaZOEoDNc?feature=shared",
        title: "LIVE - Total Knee Replacement Surgery by Knee Expert"
      },
      {
        img: img5,
        link: "https://youtu.be/7B48Ynz8KNk?feature=shared",
        title: "Living Donor Liver Transplantation Donor and Recipient Procedures"
      }
    ];
  
    return (
      <section id="videos" className="py-20 bg-white text-center">
        <motion.h2
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.1 }}
          className="text-4xl font-bold text-red-600 mb-12"
        >
          Watch Videos
        </motion.h2>
        <div className="flex justify-center">
          {videos.map((video, index) => (
            <a key={index} target='_blank' className="relative group w-80 m-4" href={video.link}>
              <img
                src={video.img}
                alt=""
                className="w-full h-auto rounded-lg shadow-lg transition-transform duration-300"
              />
              {/* Bottom Overlay with Title on Hover */}
              <div className="absolute bottom-0 left-0 w-full bg-gray-800 bg-opacity-60 backdrop-blur-md text-white text-center py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-lg">
                {video.title}
              </div>
            </a>
          ))}
        </div>
      </section>
    );
  }
/* =====================================================================
   MAIN Home COMPONENT
   ===================================================================== */
function Home() {
  // GSAP ScrollTrigger for elements with the "animate" class
  useEffect(() => {
    gsap.utils.toArray('.animate').forEach((elem) => {
      gsap.from(elem, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: elem,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    });
  }, []);

  return (
    <div className="overflow-x-hidden">
      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <Videos />
        <HowItWorksSection />
        <TechnologySection />
        <TestimonialsSection />
        <ContactSection />
      </main>
    </div>
  );
}

export default Home;
