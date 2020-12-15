const generateMessage = data => {
  return {
    ...data,
    createdAt: new Date().getTime(),
  };
};

const generateLocationMessage = data => {
  return {
    ...data,
    createdAt: new Date().getTime(),
  };
};

module.exports = {
  generateMessage,
  generateLocationMessage,
};
