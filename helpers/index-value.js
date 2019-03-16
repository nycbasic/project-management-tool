module.exports = function findIndex(obj, params, type) {
  let index = [];

  if (typeof params === "string") {
    obj.forEach((item, i) => {
      if (item[type].toString() === params) {
        index.push(i);
      }
    });

    return {
      current_item: index.length >= 1 ? obj[index[0]] : false,
      current_index: index[0]
    };
  } else if (Object.keys(params).length > 1) {
    obj.forEach((item, i) => {
      if (item[type].toString() === params.first) {
        index.push(i);

        obj[index[0]].todos.forEach((item, i) => {
          if (item[type].toString() === params.second) {
            return index.push(i);
          }
        });
      }
    });
    return {
      current_item: index.length === 2 ? obj[index[0]].todos[index[1]] : false,
      first_index: index[0],
      second_index: index[1]
    };
  }
};
