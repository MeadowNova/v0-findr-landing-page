"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Radar, Search, Zap, MessageSquare, CheckCircle, ArrowRight, Lock, Sparkles } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

export default function Home() {
  const [isHovered, setIsHovered] = useState(false)
  const [isCtaHovered, setIsCtaHovered] = useState(false)

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100">
      {/* Navbar */}
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Radar className="h-8 w-8 text-blue-500" />
          <span className="text-2xl font-bold">Findr</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="hover:text-blue-400 transition">
            How It Works
          </a>
          <a href="#testimonials" className="hover:text-blue-400 transition">
            Testimonials
          </a>
          <a href="#pricing" className="hover:text-blue-400 transition">
            Pricing
          </a>
        </nav>
        <Button className="bg-blue-500 hover:bg-blue-600">Get Started</Button>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600/20 to-blue-400/20 border border-blue-500/30 text-blue-400 text-base md:text-lg font-medium mb-6 shadow-lg animate-pulse hover:scale-105 transition-transform">
            <div className="bg-blue-500/20 rounded-full p-1.5 mr-3">
              <Sparkles className="h-5 w-5 text-blue-400" />
            </div>
            <span className="relative">
              <span className="font-bold">NEW:</span> AI-Powered Deal Concierge for Marketplace Shoppers
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            We Hunt Facebook Marketplace <span className="text-blue-500">So You Don't Have To.</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Tell us what you want. We'll track it down fast—and deliver exact matches straight to your phone. Free to
            try. Pay only when we deliver.
          </p>

          <div
            className="relative group"
            onMouseEnter={() => setIsCtaHovered(true)}
            onMouseLeave={() => setIsCtaHovered(false)}
          >
            {/* Animated glow effect */}
            <div
              className={`absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-400 rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-1000 ${isCtaHovered ? "animate-pulse" : ""}`}
            ></div>

            <Button
              size="lg"
              className="relative bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-lg px-10 py-7 h-auto w-full sm:w-auto font-bold shadow-xl border border-blue-500/20 transition-all duration-300 group-hover:translate-y-[-2px] overflow-hidden"
              onClick={() => document.getElementById("search-form")?.scrollIntoView({ behavior: "smooth" })}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-blue-400/10 to-transparent skew-x-[-20deg] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <span className="flex items-center justify-center relative z-10">
                Get My Deal Hunt Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></span>
            </Button>

            {/* Floating elements */}
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-bounce">
              Free First Match!
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-gray-400 border-gray-700 px-3 py-1">
                <Lock className="h-3 w-3 mr-1" /> Secure payments
              </Badge>
              <Badge variant="outline" className="text-gray-400 border-gray-700 px-3 py-1">
                <CheckCircle className="h-3 w-3 mr-1" /> No subscriptions
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-slate-700 border border-slate-800 flex items-center justify-center text-xs"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3.5 w-3.5 text-green-400 mr-1.5" />
                <span className="text-gray-300 text-sm">Trusted by 500+ early users</span>
              </div>
              <div className="flex items-center ml-4">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-1.5"></div>
                <span className="text-gray-300 text-sm">23 items found today</span>
              </div>
            </div>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <div className="relative w-full max-w-md">
            {/* Multiple fluid glowing blobs */}
            <div className="absolute -inset-1 z-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px]">
                <div className="absolute top-0 left-0 w-[180px] h-[180px] bg-blue-500 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-0 w-[160px] h-[160px] bg-purple-500 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-20 w-[170px] h-[170px] bg-cyan-500 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
              </div>
            </div>

            <div className="relative bg-slate-800 rounded-[40px] p-6 shadow-xl border-4 border-slate-700 max-w-[320px] mx-auto z-10">
              {/* iPhone notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-[14px] z-10"></div>

              {/* Status bar */}
              <div className="flex justify-between items-center mb-6 mt-1 px-2 text-xs text-gray-300">
                <div>9:41</div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-3 bg-gray-300 rounded-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-3/4 bg-gray-100"></div>
                  </div>
                  <div>100%</div>
                </div>
              </div>

              {/* Side button */}
              <div className="absolute -right-2 top-[80px] h-8 w-1 bg-slate-700 rounded-l-md"></div>

              {/* Content */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold">Findr Match</h3>
                  <p className="text-sm text-gray-400">Just found for you</p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden mb-4 border border-slate-600">
                <div className="bg-slate-700 px-2 py-1 text-xs flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Facebook Marketplace</span>
                </div>
                <Image
                  src="/placeholder.svg?height=200&width=350"
                  alt="Vintage Mid-Century Couch - Facebook Marketplace Listing"
                  width={350}
                  height={200}
                  className="w-full object-cover"
                />
                <div className="bg-slate-700 p-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Vintage Mid-Century Couch</span>
                    <span className="text-green-400 font-bold">$350</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span>San Francisco, CA</span>
                    <span>Posted 23m ago</span>
                  </div>
                </div>
              </div>
              <h3 className="font-bold mb-1">Vintage Mid-Century Couch</h3>
              <p className="text-green-400 font-bold mb-2">$350 (Under your budget!)</p>
              <p className="text-sm text-gray-400 mb-4">Posted 23 minutes ago · 5.2 miles away</p>
              <Button className="w-full bg-blue-500 hover:bg-blue-600">Unlock This Match · $4.99</Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-slate-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Tell us what you're looking for</h3>
              <p className="text-gray-300">A vintage couch? A PS5 under $400? You name it.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Radar className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">We hunt listings in real time</h3>
              <p className="text-gray-300">Our AI scours Facebook Marketplace and filters out the junk.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">You get exact matches fast</h3>
              <p className="text-gray-300">You only pay when we send you the deal. No subscriptions. No spam.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">People are loving Findr.</h2>
          <p className="text-gray-300 text-center max-w-2xl mx-auto mb-16">
            Join hundreds of happy deal hunters who save time and money.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Found my kid's Xbox in 2 hours. Unreal.",
                author: "Jenna, Chicago",
                rating: 5,
              },
              {
                quote: "Saved me so much time. I'd pay double.",
                author: "Sam, Austin",
                rating: 5,
              },
              {
                quote: "I stopped checking Marketplace altogether. Findr just does it.",
                author: "Taylor, Denver",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex mb-2">
                    {Array(testimonial.rating)
                      .fill(0)
                      .map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-.181h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                  </div>
                  <p className="text-lg mb-4">"{testimonial.quote}"</p>
                  <p className="text-gray-400">– {testimonial.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-16">
            <Badge variant="outline" className="text-gray-300 border-gray-700 px-4 py-2 text-sm">
              <Lock className="h-4 w-4 mr-2" /> Secure payments by Stripe
            </Badge>
            <Badge variant="outline" className="text-gray-300 border-gray-700 px-4 py-2 text-sm">
              <CheckCircle className="h-4 w-4 mr-2" /> Trusted by 500+ early users
            </Badge>
            <Badge variant="outline" className="text-gray-300 border-gray-700 px-4 py-2 text-sm">
              <Lock className="h-4 w-4 mr-2" /> Built on ethical AI + secure data
            </Badge>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-24 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"></div>

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-blue-500/10"
              style={{
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 15}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
            ></div>
          ))}
        </div>

        {/* Animated gradient lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent top-1/4 animate-[slide_15s_linear_infinite]"></div>
          <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent top-2/4 animate-[slide_20s_linear_infinite_reverse]"></div>
          <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-blue-500/15 to-transparent top-3/4 animate-[slide_25s_linear_infinite]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center mb-16">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-blue-500" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
              Free to Use. Pay When We Deliver.
            </h2>
            <p className="text-gray-300 text-center max-w-2xl mx-auto">
              You'll never pay unless we find a listing that matches your request.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div
              className="relative group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Animated glow effect */}
              <div
                className={`absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl blur opacity-30 group-hover:opacity-70 transition duration-1000 ${isHovered ? "animate-pulse" : ""}`}
              ></div>

              <Card className="relative bg-slate-900/90 backdrop-blur-sm border-blue-500/20 shadow-xl transition-all duration-300 group-hover:translate-y-[-4px]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl group-hover:text-blue-400 transition-colors">
                        Finder's Fee
                      </CardTitle>
                      <CardDescription className="text-gray-400">Only pay when we deliver results</CardDescription>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline mb-6 group-hover:scale-105 transition-transform origin-left">
                    <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                      $4.99
                    </span>
                    <span className="text-gray-400 ml-2">per unlocked match</span>
                  </div>
                  <ul className="space-y-4">
                    {[
                      { text: "First match is FREE", highlight: true },
                      { text: "No monthly subscription", highlight: false },
                      { text: "No spam, only exact matches", highlight: false },
                      { text: "Pay only for what you want", highlight: false },
                      { text: "Cancel anytime", highlight: false },
                    ].map((feature, index) => (
                      <li
                        key={index}
                        className={`flex items-center ${feature.highlight ? "text-blue-400" : ""} group-hover:translate-x-1 transition-transform duration-300 delay-${index * 100}`}
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 flex-shrink-0">
                          <CheckCircle className={`h-3 w-3 ${feature.highlight ? "text-blue-400" : "text-blue-500"}`} />
                        </div>
                        <span>{feature.text}</span>
                        {feature.highlight && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                            Popular
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-col">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 py-6 h-auto text-lg relative overflow-hidden group">
                    <span className="relative z-10 flex items-center justify-center">
                      Get Started Now
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  </Button>
                  <p className="text-sm text-gray-400 mt-6 text-center">
                    Want unlimited finds?{" "}
                    <span className="text-blue-400 cursor-pointer hover:underline">Coming soon</span>
                  </p>
                </CardFooter>
              </Card>
            </div>

            {/* Testimonial callout */}
            <div className="mt-12 bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-.181h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <p className="text-sm italic text-gray-300">
                  "I found exactly what I was looking for in under an hour. The $4.99 fee saved me days of scrolling
                  through listings."
                </p>
                <p className="text-xs text-gray-400 mt-1">— Alex from New York</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            className="w-full h-auto text-slate-900 fill-current"
          >
            <path d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,213.3C840,224,960,224,1080,208C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Search Form */}
      <section id="search-form" className="py-20 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-32 bg-blue-500/10 transform -skew-y-3"></div>
        <div className="absolute bottom-0 right-0 w-full h-32 bg-blue-500/5 transform skew-y-3"></div>

        {/* Animated dots */}
        <div className="absolute top-20 left-10 w-6 h-6 rounded-full bg-blue-500/20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-4 h-4 rounded-full bg-blue-500/30 animate-ping"></div>
        <div className="absolute bottom-20 left-1/4 w-5 h-5 rounded-full bg-blue-500/20 animate-pulse"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Search className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
              Tell Us What You Want. We'll Hunt It.
            </h2>
            <p className="text-gray-300 text-center mb-10 max-w-lg mx-auto">
              Your first match is completely free. No credit card required.
              <span className="block mt-2 text-blue-400">Join 500+ deal hunters saving time and money.</span>
            </p>

            <Card className="bg-slate-800/80 border-blue-500/20 shadow-xl backdrop-blur-sm transform transition-all hover:scale-[1.01]">
              <CardContent className="pt-6">
                <form className="space-y-6">
                  <div className="relative group">
                    <label
                      htmlFor="item"
                      className="block text-sm font-medium mb-2 group-focus-within:text-blue-400 transition-colors"
                    >
                      What are you looking for?
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500" />
                      <Input
                        id="item"
                        placeholder="e.g., Vintage mid-century couch, PS5, iPhone 13..."
                        className="bg-slate-900 border-slate-700 pl-10 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Be specific for better matches!</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <label
                        htmlFor="max-price"
                        className="block text-sm font-medium mb-2 group-focus-within:text-blue-400 transition-colors"
                      >
                        Max price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                        <Input
                          id="max-price"
                          type="number"
                          placeholder="Amount"
                          className="bg-slate-900 border-slate-700 pl-8 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>
                    <div className="relative group">
                      <label
                        htmlFor="zip-code"
                        className="block text-sm font-medium mb-2 group-focus-within:text-blue-400 transition-colors"
                      >
                        Zip code
                      </label>
                      <Input
                        id="zip-code"
                        placeholder="For local search radius"
                        className="bg-slate-900 border-slate-700 focus:border-blue-500 transition-all"
                      />
                      <div className="absolute right-3 top-[38px] text-xs text-blue-400 cursor-pointer hover:underline">
                        Use my location
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    <label
                      htmlFor="contact"
                      className="block text-sm font-medium mb-2 group-focus-within:text-blue-400 transition-colors"
                    >
                      How should we contact you?
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="contact"
                        placeholder="Email or phone number"
                        className="bg-slate-900 border-slate-700 pl-10 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 flex items-center">
                      <Lock className="h-3 w-3 mr-1 inline" /> We'll only use this to send you matches.
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 py-6 h-auto text-lg relative overflow-hidden group">
                      <span className="relative z-10 flex items-center justify-center">
                        Start My Search{" "}
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    </Button>

                    <div className="flex items-center justify-center mt-6 gap-2">
                      <Badge variant="outline" className="text-gray-300 border-gray-700 px-3 py-1">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-400" /> Free first match
                      </Badge>
                      <Badge variant="outline" className="text-gray-300 border-gray-700 px-3 py-1">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-400" /> No subscription
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center">
                      <Lock className="h-3 w-3 mr-1" /> We never sell or share your data. Your request is 100% private.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="mt-12 text-center">
              <p className="text-sm text-gray-400 mb-3">Already used Findr? Check your matches</p>
              <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                View My Matches
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <Radar className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold">Findr</span>
              <span className="text-sm text-gray-400 ml-2">Your Personal Deal Hunter</span>
            </div>

            <div className="flex flex-wrap gap-6 mb-6 md:mb-0 justify-center">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                About
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                Contact
              </a>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              © {new Date().getFullYear()} Findr. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Powered by</span>
              <span className="font-medium">Bright Data + Stripe</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
