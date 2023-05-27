import ky from "ky";
import cheerio from "cheerio";

/**
 * The function fetches metadata and page content from a given website URL using Cheerio and Ky
 * libraries in JavaScript.
 * @param url - The URL of the website whose content needs to be fetched.
 * @returns The function `fetchWebsiteContent` returns an object with two properties: `metaData` and
 * `pageContent`. `metaData` is an object containing metadata information extracted from the website's
 * `<meta>` tags, and `pageContent` is an array containing the text content of the website's `<div>`,
 * `<h1>`-`<h6>`, and `<p>` tags.
 */
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