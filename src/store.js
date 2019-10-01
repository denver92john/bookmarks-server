const uuid = require('uuid/v4');

const bookmarks = [
    {
        id: uuid(),
        title: "Thinkful",
        url: "https://www.thinkful.com",
        description: "Think outside the classroom",
        rating: 5
    },
    {
        id: uuid(),
        title: "Google",
        url: "https://www.google.com",
        description: "Where we find everything else",
        rating: 4
    },
    {
        id: uuid(),
        title: "MDN",
        url: "https://developer.mozilla.org",
        description: "The only place to find web documentation",
        rating: 5
    },
    {
        id: uuid(),
        title: "Pitchfork",
        url: "https://pitchfork.com/",
        description: "",
        rating: 1
    },
    {
        id: uuid(),
        title: "Greg's List",
        url: "https://drive.google.com/file/d/1qod72mehc0BF5scBM-z3O8mIuivpbRi7/view?usp=sharing",
        description: "sdfasdf",
        rating: 1
    }
];

module.exports = {bookmarks};