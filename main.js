const books = [];
const RENDER_EVENT = "render-book";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  const inputBookIsComplete = document.getElementById("inputBookIsComplete");
  inputBookIsComplete.addEventListener("change", function () {
    if (inputBookIsComplete.checked) {
      isComplete = true;
    } else {
      isComplete = false;
    }
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const searchForm = document.getElementById("searchBook");
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBooks();
  });
});

function addBook() {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = document.getElementById("inputBookYear").value;
  const inputBookIsComplete = document.getElementById("inputBookIsComplete");
  const isComplete = inputBookIsComplete.checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, isComplete);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  const yearNumber = parseInt(year);
  return {
    id,
    title,
    author,
    year: yearNumber,
    isComplete,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
  incompleteBookshelfList.innerHTML = "";

  const completeBookshelfList = document.getElementById("completeBookshelfList");
  completeBookshelfList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) incompleteBookshelfList.append(bookElement);
    else completeBookshelfList.append(bookElement);
  }
});

function makeBook(bookObject) {
  const title = document.createElement("h3");
  title.innerText = bookObject.title;

  const author = document.createElement("p");
  author.innerText = `Penulis: ${bookObject.author}`;

  const year = document.createElement("p");
  year.innerText = `Tahun: ${bookObject.year}`;

  const actionDiv = document.createElement("div");
  actionDiv.classList.add("action");

  const article = document.createElement("article");
  article.classList.add("book_item");
  article.append(title, author, year, actionDiv);

  if (bookObject.isComplete) {
    const incompleteButton = document.createElement("button");
    incompleteButton.classList.add("green");
    incompleteButton.innerText = "Belum selesai dibaca";

    incompleteButton.setAttribute("data-book-id", bookObject.id);

    incompleteButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("blue");
    editButton.innerText = "Edit buku";

    editButton.addEventListener("click", function () {
      editBook(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("red");
    deleteButton.innerText = "Hapus buku";

    deleteButton.addEventListener("click", function () {
      const shouldDelete = confirm("Apakah Anda yakin ingin menghapus buku ini?");
      if (shouldDelete) {
        removeBookFromCompleted(bookObject.id);
        removeBookFromSearch(bookObject.id);
      }
    });

    actionDiv.append(incompleteButton, editButton, deleteButton);
  } else {
    const completeButton = document.createElement("button");
    completeButton.classList.add("green");
    completeButton.innerText = "Selesai dibaca";

    completeButton.setAttribute("data-book-id", bookObject.id);

    completeButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("blue");
    editButton.innerText = "Edit buku";

    editButton.addEventListener("click", function () {
      editBook(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("red");
    deleteButton.innerText = "Hapus buku";

    deleteButton.addEventListener("click", function () {
      const shouldDelete = confirm("Apakah Anda yakin ingin menghapus buku ini?");
      if (shouldDelete) {
        removeBookFromCompleted(bookObject.id);
        removeBookFromSearch(bookObject.id);
      }
    });

    actionDiv.append(completeButton, editButton, deleteButton);
  }

  return article;
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function editBook(bookId) {
  const book = findBook(bookId);

  if (book == null) return;

  const newTitle = prompt("Masukkan judul buku yang baru:", book.title);
  const newAuthor = prompt("Masukkan penulis buku yang baru:", book.author);
  const newYearStr = prompt("Masukkan tahun buku yang baru:", book.year);
  const newYear = parseInt(newYearStr);

  if (newTitle !== null) {
    book.title = newTitle;
    book.author = newAuthor;
    book.year = newYear;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBooks() {
  const searchTitle = document.getElementById("searchBookTitle").value.toLowerCase();

  const searchBookshelfList = document.getElementById("searchBookshelfList");
  searchBookshelfList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = doSearchBooks(bookItem);

    if ((!bookItem.isComplete && bookItem.title.toLowerCase().includes(searchTitle)) || (bookItem.isComplete && bookItem.title.toLowerCase().includes(searchTitle))) {
      searchBookshelfList.append(bookElement);
    }
  }
}

function doSearchBooks(bookObject) {
  const title = document.createElement("h3");
  title.innerText = bookObject.title;

  const author = document.createElement("p");
  author.innerText = `Penulis: ${bookObject.author}`;

  const year = document.createElement("p");
  year.innerText = `Tahun: ${bookObject.year}`;

  const actionDiv = document.createElement("div");
  actionDiv.classList.add("action");

  const article = document.createElement("article");
  article.classList.add("book_item");
  article.append(title, author, year, actionDiv);

  article.dataset.bookId = bookObject.id;

  if (bookObject.isComplete) {
    const incompleteButton = document.createElement("button");
    incompleteButton.classList.add("green");
    incompleteButton.innerText = "Belum selesai dibaca";

    incompleteButton.setAttribute("data-book-id", bookObject.id);

    incompleteButton.addEventListener("click", function () {
      undoBookFromCompletedInsearch(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("blue");
    editButton.innerText = "Edit buku";

    editButton.addEventListener("click", function () {
      editBookInsearch(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("red");
    deleteButton.innerText = "Hapus buku";

    deleteButton.addEventListener("click", function () {
      const shouldDelete = confirm("Apakah Anda yakin ingin menghapus buku ini?");
      if (shouldDelete) {
        removeBookFromCompleted(bookObject.id);
        removeBookFromSearch(bookObject.id);
      }
    });

    actionDiv.append(incompleteButton, editButton, deleteButton);
  } else {
    const completeButton = document.createElement("button");
    completeButton.classList.add("green");
    completeButton.innerText = "Selesai dibaca";

    completeButton.setAttribute("data-book-id", bookObject.id);

    completeButton.addEventListener("click", function () {
      addBookToCompletedInsearch(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("blue");
    editButton.innerText = "Edit buku";

    editButton.addEventListener("click", function () {
      editBookInsearch(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("red");
    deleteButton.innerText = "Hapus buku";

    deleteButton.addEventListener("click", function () {
      const shouldDelete = confirm("Apakah Anda yakin ingin menghapus buku ini?");
      if (shouldDelete) {
        removeBookFromCompleted(bookObject.id);
        removeBookFromSearch(bookObject.id);
      }
    });

    actionDiv.append(completeButton, editButton, deleteButton);
  }

  return article;
}

function addBookToCompletedInsearch(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  searchBooks();

  const button = document.querySelector(`[data-book-id="${bookId}"] .green`);
  if (button) {
    button.innerText = "Belum selesai dibaca";
  }
}

function undoBookFromCompletedInsearch(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  searchBooks();

  const button = document.querySelector(`[data-book-id="${bookId}"] .green`);
  if (button) {
    button.innerText = "Selesai dibaca";
  }
}

function removeBookFromSearch(bookId) {
  const bookContainer = document.querySelector(`[data-book-id="${bookId}"]`);
  if (bookContainer) {
    bookContainer.remove();
  }
}

function editBookInsearch(bookId) {
  const book = findBook(bookId);

  if (book == null) return;

  const newTitle = prompt("Masukkan judul buku yang baru:", book.title);
  const newAuthor = prompt("Masukkan penulis buku yang baru:", book.author);
  const newYearStr = prompt("Masukkan tahun buku yang baru:", book.year);
  const newYear = parseInt(newYearStr);

  if (newTitle !== null) {
    book.title = newTitle;
    book.author = newAuthor;
    book.year = newYear;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    searchBooks();
  }
}
