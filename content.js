window.open = function() {
  console.log('Popup blocked!');
  return null;
};