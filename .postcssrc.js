const postcssUrl = () => {
  // TODO: share `netlifyUrl`-definition with build.js
  const netlifyUrlPrefix = process.env.REVIEW_ID
    ? `deploy-preview-${process.env.REVIEW_ID}--`
    : '';
  const netlifyUrl = `https://${netlifyUrlPrefix}amazing-hodgkin-d968dc.netlify.com`;
  // TODO: do not blindly assume the dev server URL
  const cdnUrl =
    process.env.NODE_ENV === 'production'
      ? netlifyUrl
      : 'http://localhost:8080';

  return require('postcss-url')({
    url: ({ url }) => `${cdnUrl}/static/${url}`,
  });
};

module.exports = {
  plugins: [require('autoprefixer'), postcssUrl()],
};
