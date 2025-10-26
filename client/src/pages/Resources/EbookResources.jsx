import { useState } from 'react';
import { ExternalLink, BookOpen, Search, GraduationCap, Library, Globe } from 'lucide-react';

const EbookResources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const ebookResources = [
    // Indian Government Resources
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
      name: 'e-Pathshala',
      url: 'https://epathshala.nic.in/',
      description: 'Joint initiative of MHRD, NCERT and CIET. Digital textbooks and resources for students.',
      category: 'Educational',
      icon: '📱'
    },
    
    // Classic Literature & General
    {
      name: 'Project Gutenberg',
      url: 'https://www.gutenberg.org/',
      description: 'Over 70,000 free eBooks. Download and read classic literature and historical documents.',
      category: 'Classic Literature',
      icon: '📖',
      popular: true
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
      name: 'Internet Archive',
      url: 'https://archive.org/',
      description: 'Non-profit library of millions of free books, movies, software, music, and more.',
      category: 'General',
      icon: '📦',
      popular: true
    },
    {
      name: 'Manybooks',
      url: 'https://manybooks.net/',
      description: 'Over 50,000 free eBooks in various formats. Fiction and non-fiction.',
      category: 'General',
      icon: '📚'
    },
    {
      name: 'Feedbooks',
      url: 'https://www.feedbooks.com/publicdomain',
      description: 'Thousands of public domain books and original works from independent authors.',
      category: 'Classic Literature',
      icon: '📕'
    },
    {
      name: 'Standard Ebooks',
      url: 'https://standardebooks.org/',
      description: 'High-quality, carefully formatted public domain ebooks.',
      category: 'Classic Literature',
      icon: '✨'
    },
    
    // Technology & Programming
    {
      name: 'Free Programming Books',
      url: 'https://github.com/EbookFoundation/free-programming-books',
      description: 'Comprehensive list of free programming books, courses, and resources.',
      category: 'Technology',
      icon: '💻',
      popular: true
    },
    {
      name: 'O\'Reilly Open Books',
      url: 'https://www.oreilly.com/openbook/',
      description: 'Free technology and programming books from O\'Reilly Media.',
      category: 'Technology',
      icon: '🐘'
    },
    {
      name: 'Microsoft Docs',
      url: 'https://docs.microsoft.com/',
      description: 'Free documentation, tutorials, and e-books on Microsoft technologies.',
      category: 'Technology',
      icon: '🪟'
    },
    {
      name: 'GoalKicker',
      url: 'https://goalkicker.com/',
      description: 'Free programming books compiled from Stack Overflow Documentation.',
      category: 'Technology',
      icon: '🎯'
    },
    
    // Academic & Research
    {
      name: 'arXiv.org',
      url: 'https://arxiv.org/',
      description: 'Free distribution service for scholarly articles in physics, mathematics, computer science, and more.',
      category: 'Research',
      icon: '🔬'
    },
    {
      name: 'Directory of Open Access Books (DOAB)',
      url: 'https://www.doabooks.org/',
      description: 'Academic peer-reviewed books from open access publishers.',
      category: 'Academic',
      icon: '📘'
    },
    {
      name: 'Open Textbook Library',
      url: 'https://open.umn.edu/opentextbooks/',
      description: 'Free peer-reviewed textbooks for college courses.',
      category: 'Educational',
      icon: '📓'
    },
    {
      name: 'OpenStax',
      url: 'https://openstax.org/',
      description: 'Free peer-reviewed, openly licensed college textbooks.',
      category: 'Educational',
      icon: '📗'
    },
    {
      name: 'MIT OpenCourseWare',
      url: 'https://ocw.mit.edu/',
      description: 'Free course materials from MIT. Lecture notes, exams, and textbooks.',
      category: 'Academic',
      icon: '🎓'
    },
    {
      name: 'PLOS (Public Library of Science)',
      url: 'https://plos.org/',
      description: 'Open access scientific journals and research articles.',
      category: 'Research',
      icon: '🧬'
    },
    {
      name: 'JSTOR Open Content',
      url: 'https://about.jstor.org/oa-and-free/',
      description: 'Free access to thousands of scholarly articles and books.',
      category: 'Academic',
      icon: '📚'
    },
    
    // Professional & Business
    {
      name: 'Bookboon',
      url: 'https://bookboon.com/',
      description: 'Free textbooks for students and professionals in business, engineering, and IT.',
      category: 'Professional',
      icon: '📊'
    },
    {
      name: 'FreeTechBooks',
      url: 'https://www.freetechbooks.com/',
      description: 'Free technology books covering programming, computer science, engineering.',
      category: 'Technology',
      icon: '💾'
    },
    
    // Search Engines & Aggregators
    {
      name: 'Google Books',
      url: 'https://books.google.co.in/',
      description: 'Search and preview millions of books. Many available for free full-text reading.',
      category: 'General',
      icon: '🔍'
    },
    {
      name: 'PDF Drive',
      url: 'https://www.pdfdrive.com/',
      description: 'Search engine for PDF files with millions of free books.',
      category: 'General',
      icon: '📄'
    },
    {
      name: 'Z-Library',
      url: 'https://z-lib.org/',
      description: 'One of the world\'s largest online libraries with millions of books and articles.',
      category: 'General',
      icon: '📚'
    },
    {
      name: 'Library Genesis',
      url: 'http://libgen.rs/',
      description: 'Search engine for scientific articles and books. Millions of files available.',
      category: 'Academic',
      icon: '🔬'
    },
    
    // Language Learning
    {
      name: 'Duolingo Stories',
      url: 'https://www.duolingo.com/stories',
      description: 'Free short stories for language learning in multiple languages.',
      category: 'Language',
      icon: '🗣️'
    },
    {
      name: 'BBC Languages',
      url: 'http://www.bbc.co.uk/languages/',
      description: 'Free resources for learning over 40 languages.',
      category: 'Language',
      icon: '🌍'
    },
    
    // Children & Young Adults
    {
      name: 'International Children\'s Digital Library',
      url: 'http://en.childrenslibrary.org/',
      description: 'Free digital library of outstanding children\'s books from around the world.',
      category: 'Children',
      icon: '👶'
    },
    {
      name: 'Storyline Online',
      url: 'https://www.storylineonline.net/',
      description: 'Videos of celebrated actors reading children\'s books aloud.',
      category: 'Children',
      icon: '🎭'
    },
    
    // Science & Math
    {
      name: 'Khan Academy',
      url: 'https://www.khanacademy.org/',
      description: 'Free educational resources covering math, science, and more.',
      category: 'Educational',
      icon: '🧮'
    },
    {
      name: 'NASA eBooks',
      url: 'https://www.nasa.gov/ebooks/',
      description: 'Free e-books from NASA about space, science, and technology.',
      category: 'Science',
      icon: '🚀'
    },
    {
      name: 'BioMed Central',
      url: 'https://www.biomedcentral.com/',
      description: 'Open access research articles in biology and medicine.',
      category: 'Science',
      icon: '🧪'
    },
    
    // History & Politics
    {
      name: 'Library of Congress Digital Collections',
      url: 'https://www.loc.gov/collections/',
      description: 'Free access to millions of historical items including books, photos, and manuscripts.',
      category: 'History',
      icon: '🏛️'
    },
    {
      name: 'Digital Public Library of America',
      url: 'https://dp.la/',
      description: 'Access to millions of photographs, books, maps, and materials from libraries and museums.',
      category: 'History',
      icon: '🗽'
    },
    
    // Religion & Philosophy
    {
      name: 'Sacred Texts',
      url: 'https://www.sacred-texts.com/',
      description: 'Freely available religious and spiritual texts from world traditions.',
      category: 'Religion',
      icon: '🕉️'
    },
    {
      name: 'Early Church Texts',
      url: 'http://www.earlychurchtexts.com/',
      description: 'Free access to early Christian writings and texts.',
      category: 'Religion',
      icon: '✝️'
    },
    
    // Fiction & Entertainment
    {
      name: 'Smashwords',
      url: 'https://www.smashwords.com/books/category/1/newest/0/free/any',
      description: 'Platform for independent authors. Many free fiction and non-fiction titles.',
      category: 'Fiction',
      icon: '✍️'
    },
    {
      name: 'Wattpad',
      url: 'https://www.wattpad.com/',
      description: 'World\'s largest community for readers and writers. Millions of free stories.',
      category: 'Fiction',
      icon: '📝'
    },
    
    // Comics & Graphic Novels
    {
      name: 'Digital Comic Museum',
      url: 'https://digitalcomicmuseum.com/',
      description: 'Public domain Golden Age comics available for free download.',
      category: 'Comics',
      icon: '💥'
    },
    {
      name: 'Comic Book Plus',
      url: 'https://comicbookplus.com/',
      description: 'Free and legal public domain comic books.',
      category: 'Comics',
      icon: '📰'
    },
    
    // Audiobooks
    {
      name: 'LibriVox',
      url: 'https://librivox.org/',
      description: 'Free public domain audiobooks read by volunteers.',
      category: 'Audiobooks',
      icon: '🎧'
    },
    {
      name: 'Loyal Books',
      url: 'http://www.loyalbooks.com/',
      description: 'Free audiobooks and e-books of classic literature.',
      category: 'Audiobooks',
      icon: '🔊'
    },
    
    // International Libraries
    {
      name: 'Europeana',
      url: 'https://www.europeana.eu/',
      description: 'Digital platform for European cultural heritage with millions of items.',
      category: 'International',
      icon: '🇪🇺'
    },
    {
      name: 'World Digital Library',
      url: 'https://www.wdl.org/',
      description: 'Cultural materials from libraries around the world.',
      category: 'International',
      icon: '🌏'
    },
    {
      name: 'Project MUSE',
      url: 'https://muse.jhu.edu/',
      description: 'Leading provider of digital humanities and social science content.',
      category: 'Academic',
      icon: '🎨'
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

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Category Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
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

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Search</label>
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
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600 font-medium">
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

