export const formatFileSize = (bytes: number) => {
  var i = -1;
  var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
  do {
    bytes /= 1000;
    i++;
  } while (bytes > 1000);

  return Math.max(bytes, 0.1).toFixed(1) + byteUnits[i];
};
