const generateMessage = text => {
  return {
    text,
    createdAt: new Date().getTime(),
  };
};

const generateLocationMessage = pos => {
  return {
    url: `https://google.com/maps?q=${pos.latitude},${pos.longitude}`,
    createdAt: new Date().getTime(),
  };
};

module.exports = {
  generateMessage,
  generateLocationMessage,
};
