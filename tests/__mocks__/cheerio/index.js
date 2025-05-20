// Mock implementation of cheerio
const cheerio = {
  load: jest.fn().mockImplementation((html) => {
    // Create a mock cheerio instance
    const $ = function(selector) {
      // Mock implementation of the cheerio selector function
      const elements = {
        find: jest.fn().mockReturnThis(),
        filter: jest.fn().mockReturnThis(),
        first: jest.fn().mockReturnThis(),
        last: jest.fn().mockReturnThis(),
        text: jest.fn().mockReturnValue('Mock Text'),
        attr: jest.fn().mockReturnValue('https://example.com/mock'),
        each: jest.fn().mockImplementation((callback) => {
          // Mock calling the callback for a few elements
          for (let i = 0; i < 5; i++) {
            callback(i, elements);
          }
          return elements;
        }),
        length: 5
      };
      
      return elements;
    };
    
    // Add properties and methods to the $ function
    $.find = jest.fn().mockReturnThis();
    $.filter = jest.fn().mockReturnThis();
    $.first = jest.fn().mockReturnThis();
    $.last = jest.fn().mockReturnThis();
    $.text = jest.fn().mockReturnValue('Mock Text');
    $.attr = jest.fn().mockReturnValue('https://example.com/mock');
    $.each = jest.fn().mockImplementation((callback) => {
      // Mock calling the callback for a few elements
      for (let i = 0; i < 5; i++) {
        callback(i, $);
      }
      return $;
    });
    
    return $;
  })
};

module.exports = cheerio;