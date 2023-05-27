import ky from "ky";
import cheerio from "cheerio";

const fetchWebsiteContent = async (url) => {
  try {
    const response = await ky.get(url).text();
    const $ = cheerio.load(response);

    // Fetch MetaData
    const metaData = {};
    $('meta').each((i, elem) => {
      if ($(elem).attr('name')) metaData[$(elem).attr('name')] = $(elem).attr('content');
      if ($(elem).attr('property')) metaData[$(elem).attr('property')] = $(elem).attr('content');
    });

    // Fetch Page Content from div, h1-h6 and p tags
    const pageContent = [];
    const tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'];

    tags.forEach(tag => {
      $(tag).each((i, elem) => {
        pageContent.push($(elem).text());
      });
    });
    return { metaData, pageContent };

  } catch (error) {
    console.error(error);
  }
};

export {
  fetchWebsiteContent
}