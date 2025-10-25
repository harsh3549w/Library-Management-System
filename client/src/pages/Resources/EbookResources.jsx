import { useState } from 'react';
import { ExternalLink, BookOpen, Search, GraduationCap, Library, Globe } from 'lucide-react';

const EbookResources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const ebookResources = [
    {
      name: 'National Digital Library of India (NDLI)',
      url: 'https://ndl.iitkgp.ac.in/',
      description: 'A project by MHRD under the National Mission on Education through ICT. Access to millions of books, articles, and resources.',
      category: 'Government',
      icon: '🇮🇳',
      popular: true
    },
    {
      name: 'NPTEL',
      url: 'https://nptel.ac.in/',
      description: 'National Programme on Technology Enhanced Learning. Free online courses and e-books on engineering and sciences.',
      category: 'Educational',
      icon: '📚',
      popular: true
    },
    {
      name: 'Project Gutenberg',
      url: 'https://www.gutenberg.org/',
      description: 'Over 70,000 free eBooks. Download and read classic literature and historical documents.',
      category: 'Classic Literature',
      icon: '📖'
    },
    {
      name: 'Open Library',
      url: 'https://openlibrary.org/',
      description: 'Internet Archive\'s open library with millions of free books to borrow or download.',
      category: 'General',
      icon: '🌐',
      popular: true
    },
    {
      name: 'NCERT Books',
      url: 'https://ncert.nic.in/textbook.php',
      description: 'Free NCERT textbooks from Class 1 to 12 in multiple languages.',
      category: 'Educational',
      icon: '🎓'
    },
    {
      name: 'INFLIBNET',
      url: 'https://www.inflibnet.ac.in/',
      description: 'Information and Library Network Centre. Access to e-journals and e-books for academia.',
      category: 'Academic',
      icon: '🏛️'
    },
    {
      name: 'Shodhganga',
      url: 'https://shodhganga.inflibnet.ac.in/',
      description: 'A reservoir of Indian theses. Access to full-text of PhD theses from Indian universities.',
      category: 'Research',
      icon: '🔬'
    },
    {
      name: 'Internet Archive',
      url: 'https://archive.org/',
      description: 'Non-profit library of millions of free books, movies, software, music, and more.',
      category: 'General',
      icon: '📦',
      popular: true
    },
    {
      name: 'Google Books',
      url: 'https://books.google.co.in/',
      description: 'Search and preview millions of books. Many available for free full-text reading.',
      category: 'General',
      icon: '🔍'
    },
    {
      name: 'Free Programming Books',
      url: 'https://github.com/EbookFoundation/free-programming-books',
      description: 'Comprehensive list of free programming books, courses, and resources.',
      category: 'Technology',
      icon: '💻',
      popular: true
    },
    {
      name: 'Bookboon',
      url: 'https://bookboon.com/',
      description: 'Free textbooks for students and professionals in business, engineering, and IT.',
      category: 'Professional',
      icon: '📊'
    },
    {
      name: 'Directory of Open Access Books (DOAB)',
      url: 'https://www.doabooks.org/',
      description: 'Academic peer-reviewed books from open access publishers.',
      category: 'Academic',
      icon: '📘'
    },
    {
      name: 'Manybooks',
      url: 'https://manybooks.net/',
      description: 'Over 50,000 free eBooks in various formats. Fiction and non-fiction.',
      category: 'General',
      icon: '📚'
    },
    {
      name: 'Open Textbook Library',
      url: 'https://open.umn.edu/opentextbooks/',
      description: 'Free peer-reviewed textbooks for college courses.',
      category: 'Educational',
      icon: '📓'
    },
    {
      name: 'arXiv.org',
      url: 'https://arxiv.org/',
      description: 'Free distribution service for scholarly articles in physics, mathematics, computer science, and more.',
      category: 'Research',
      icon: '🔬'
    },
    {
      name: 'e-PG Pathshala',
      url: 'https://epgp.inflibnet.ac.in/',
      description: 'E-content for postgraduate courses in social sciences, arts, and humanities.',
      category: 'Academic',
      icon: '🎓'
    },
    {
      name: 'Swayam',
      url: 'https://swayam.gov.in/',
      description: 'MOOC platform by Government of India with free courses and study materials.',
      category: 'Government',
      icon: '🇮🇳'
    },
    {
      name: 'PDF Drive',
      url: 'https://www.pdfdrive.com/',
      description: 'Search engine for PDF files with millions of free books.',
      category: 'General',
      icon: '📄'
    }
  ];

  const categories = ['All', ...new Set(ebookResources.map(resource => resource.category))];

  const filteredResources = ebookResources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Free E-Book Resources</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Access millions of free e-books, textbooks, and academic resources from trusted sources
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Popular Resources Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Most Popular</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ebookResources.filter(r => r.popular).map(resource => (
              <a
                key={resource.name}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
              >
                <span className="text-2xl">{resource.icon}</span>
                <span className="text-sm font-medium text-gray-700 truncate flex-1">
                  {resource.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{resource.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {resource.name}
                      </h3>
                      <span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full mt-1">
                        {resource.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {resource.description}
                </p>

                {/* Visit Button */}
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Visit Resource
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <Library className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No resources found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <GraduationCap className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Important Note</h3>
              <p className="text-gray-700 text-sm">
                All resources listed are free and legal platforms. Some may require registration or have limited access. 
                Always respect copyright laws and terms of service of each platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EbookResources;

