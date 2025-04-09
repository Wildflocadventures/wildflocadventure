
import React, { useState } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout/PageLayout";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold mb-8 text-center text-orange-500">Contact Us</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="backdrop-blur-xl bg-zinc-900/90 border border-zinc-800 p-8 rounded-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white">Get In Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <Phone className="h-6 w-6 text-orange-500 mt-1 mr-4" />
                <div>
                  <h3 className="font-bold text-white">Phone</h3>
                  <p className="text-gray-300">+1 234 567 8900</p>
                  <p className="text-gray-300">+1 234 567 8901</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-orange-500 mt-1 mr-4" />
                <div>
                  <h3 className="font-bold text-white">Email</h3>
                  <p className="text-gray-300">info@wildfloc.com</p>
                  <p className="text-gray-300">support@wildfloc.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-orange-500 mt-1 mr-4" />
                <div>
                  <h3 className="font-bold text-white">Address</h3>
                  <p className="text-gray-300">
                    123 Adventure Lane<br />
                    Travel City, TC 12345<br />
                    United States
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="font-bold mb-2 text-white">Follow Us</h3>
              <div className="flex space-x-4">
                {/* Social media icons placeholder */}
                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 hover:bg-zinc-700 transition-colors cursor-pointer"></div>
                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 hover:bg-zinc-700 transition-colors cursor-pointer"></div>
                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 hover:bg-zinc-700 transition-colors cursor-pointer"></div>
                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 hover:bg-zinc-700 transition-colors cursor-pointer"></div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="backdrop-blur-xl bg-zinc-900/90 border border-zinc-800 p-8 rounded-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white">Send Us a Message</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block mb-1 font-medium text-gray-300">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block mb-1 font-medium text-gray-300">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block mb-1 font-medium text-gray-300">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block mb-1 font-medium text-gray-300">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                    required
                  ></textarea>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 flex items-center justify-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Contact;
