import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaWordpressSimple } from 'react-icons/fa';

import Logo from './headerMedia/Frame 9.png'; // Adjust the path as necessary

// Data structure for the footer links
const footerData = {
  links: [
    {
      title: 'Learn More',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Press Releases', path: '/press' },
        { name: 'Environment', path: '/environment' },
        { name: 'Jobs', path: '/jobs' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Contact Us', path: '/contact' },
      ],
    },
    {
      title: 'Tickets & Booking',
      links: [
        { name: 'Lift Tickets', path: '/tickets' },
        { name: 'Season Passes', path: '/season-passes' },
        { name: 'Vacation Packages', path: '/vacation-packages' },
      ],
    },
  ],
  contact: {
    title: 'Contact Us',
    phone: '123-456-7890',
    email: 'info@example.com',
  },
  socialLinks: [
    { icon: <FaFacebookF />, path: 'https://www.facebook.com/' },
    { icon: <FaInstagram />, path: 'https://instagram.com' },
    { icon: <FaTwitter />, path: 'https://twitter.com' },
    { icon: <FaYoutube />, path: 'https://youtube.com' },
    { icon: <FaWordpressSimple />, path: 'https://wordpress.com' },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center">
        {/* Logo */}
        <div className="w-20 mb-6 sm:mb-0 lg:mr-40">
          <Link to="/">
            <img src={Logo} alt="Logo" className="w-32 h-auto" /> {/* Adjust the width as needed */}
          </Link>
        </div>
        {/* Dynamic Links */}
        {footerData.links.map((section) => (
          <div key={section.title} className="w-full md:w-1/4 mb-6">
            <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
            <ul>
              {section.links.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-600 hover:text-gray-900">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact Information */}
        <div className="w-full md:w-1/4 mb-6">
          <h3 className="text-lg font-semibold mb-4">{footerData.contact.title}</h3>
          <p className="text-gray-600">Phone: {footerData.contact.phone}</p>
          <p className="text-gray-600">Email: {footerData.contact.email}</p>
        </div>

        {/* Social Media Links */}
        <div className="w-full md:w-1/4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <div className="flex">
            {footerData.socialLinks.map((social, index) => (
              <a key={index} href={social.path} className="text-gray-600 hover:text-gray-900 mr-4" aria-label={`Follow us on ${social.path}`}>
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="text-center text-sm text-gray-600 mt-8">
        © {new Date().getFullYear()} Your Company Name | All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;
