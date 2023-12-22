"use strict"

const URL = 'https://6400ed64ab6b7399d09e02da.mockapi.io/api/v1/products'

const containerSection = document.getElementById("container");

// добавляем наши карточки товара на страницу, если полученные данные из мокапи являются массивом

async function initialCardsRender() {
   const cards = await getCards().then(result => {
      setProducts(result)
      result.map(printCards)

      return result
   })

   if (Array.isArray(cards)) {
      cards.map(printCards);
   }
}

// создаем элементы html

const createElement = (tagName, attributes, text) => {
   const element = document.createElement(tagName);
   if (typeof attributes === "object") {
      for (const key in attributes) {
         element.setAttribute(key, attributes[key])
      }
   }
   if (!!text) {
      element.append(text)
   }
   return element
}

// непосредственно создаем элементы заголовок и контейнер для блока с карточками товаров

const title = createElement('h2', { class: "title" }, "Хиты продаж");
containerSection.append(title);

const cardsDiv = createElement('div', { class: "cards", id: "cards" });
containerSection.append(cardsDiv);

initialCardsRender()

// получаем массив из мокапи

function getCards() {            // делает запрос по указанному адресу и забирает данные
   return new Promise((resolve, reject) => {
      fetch(URL).then(response => {
         if (response.ok) {
            const result = response.json();
            resolve(result)
         } else {
            reject(new Error('Error!'))
         }
      })
   })

}

//создаем карточки товаров

const printCards = ({ name, price, img, discount, id }) => {

   const cardWrap = createElement("div", { class: "card", id: `${id}` });
   const imageWrap = createElement("div", { class: "card__image" })
   const image = createElement("img", { class: "card__jpg", id: "myImg", src: `${img}`, alt: `${name}` })
   const infoWrap = createElement("div", { class: "card__info" });
   const amountoOfDiscount = createElement("p", { class: "card__discount" }, "-" + `${discount}` + "%");
   const basketWrap = createElement("button", { class: "card__basket-link" });
   const basketImage = createElement("img", { class: "card__basket-svg", src: "img/basket.svg" })
   const priceWrap = createElement("div", { class: "card__price" });
   const fullPrice = createElement("p", { class: "card__price-full" }, countedPrice (price, discount) + "$") // вызываем функцию, которая считает цену со скидкой
   const discountPrice = createElement("p", { class: "card__price-discount" }, `${price}` + "$");
   const nameCard = createElement("p", { class: "card__name" }, `${name}`);
   basketWrap.onclick = () => {
      addTodoToLocalStorageBasket(name, countedPrice(price, discount))  // навешиваем обработчик событий на кнопку корзина
   }

   cardsDiv.append(cardWrap);
   cardWrap.append(imageWrap, priceWrap, nameCard)
   imageWrap.append(image, infoWrap,)
   infoWrap.append(amountoOfDiscount, basketWrap)
   basketWrap.append(basketImage)
   priceWrap.append(fullPrice, discountPrice)

   return cardWrap
}


// высчитываем цену со скидкой

function countedPrice (price, discount) {
   return (`${price}` * (1 - `${discount}` / 100)).toFixed(2)
}

// забираем массив из локал сторадж

function getCardsItem() {
   const cards = localStorage.getItem("cards");
   return !!cards ? JSON.parse(cards) : null;
}


// забрасываем данные о всех карточкахна странице  в локал сторадж

function setProducts(products) {
   if (Array.isArray(products)) {
      localStorage.setItem("cards", JSON.stringify(products))

      return products
   } else {
      throw new Error("Wrong data type")
   }

}


// поиск

const addElement = document.getElementById("inputSearch");

// навешиваем обработчик на инпут и вызываем функцию фильтр

addElement.addEventListener("input", (e) => {
   e.preventDefault()
   const valueText = document.getElementById("inputSearch").value
   filter(valueText)
   document.getElementById("inputSearch").focus();
})


// отфильтровываем, что вбили в поиск (если наименование товара, включает то, что ввели в инпут - выводим только эти карточки на страницу, если нет совпадений, то выводим все карточки)

function filter(valueText) {
   const allCards = getCardsItem()
   let newList = []
   if (valueText !== "") {
      for (const card of allCards) {
         if (card.name.toLowerCase().includes(valueText.toLowerCase())) {
            newList.push(card)
         } 
      }
   } else {
      newList = allCards
   }
   console.log(newList)
   cardsDiv.innerHTML = ""
   newList.map(printCards)
   return newList
}

// корзина

// получаем данные из локал сторадж корзины

function getBasketItem() {
   const goods = localStorage.getItem("goods");
   return !!goods ? JSON.parse(goods) : null;
}

function generateId() {
   return (Math.random() * 33).toFixed(2)
}

// добавляем данные отоваре (имя и цену со скидкой) в локал сторадж корзины

function addTodoToLocalStorageBasket(name, price) {
   const goods = getBasketItem() || [];
   const good = {
      id: generateId(),
      name: name,
      price: price,
   };

   goods.push(good);
   localStorage.setItem("goods", JSON.stringify(goods));

   return good;
}

// обновляем изменения в локал сторадж

function saveData(goods) {
   localStorage.setItem('goods', JSON.stringify(goods));
}

// очистить локал сторадж полностью

function clearLocalStorage() {
   localStorage.removeItem("goods");
}

// удалить данные из корзины и вывызваем функцию, которая очищает локал сторадж

function deleteAll() {
   const list = document.getElementById("modal-basket");
   list.innerHTML = "";
   clearLocalStorage();
}


function totalPrice() {
   const allItem = getBasketItem()
   let total = 0
   allItem.map((item) => {
     return total = (total + Number(item.price));
   })
   return total.toFixed(2)
}


//печатаем корзину

const printBasket = () => {

   const addedProducts = getBasketItem()

   const modalBasketWrap = createElement("div", { class: "header__modal", id: "my-modal" })
   const basketWrap = createElement("div", { class: "header__modal-wrap"})
   const basketButton = createElement("a", { class: "header__modal-btn", id: "close-my-modal-btn",  href: "#"});
   const closeBasket = createElement("img", { class: "header__modal-close", src: "img/big.svg" })
   const basketTitle = createElement("h3", { class: "header__modal-title" }, "Shopping basket");
   const basketListWrap = createElement("div", { class: "header__modal-listwrap", id: "modal-basket" })
   const basketList = createElement("ul", { class: "header__modal-list", id: "list"})

   addedProducts?.forEach(element => {
      const basketListItem = createElement("li", { class: "header__modal-listitem" });
      const basketName = createElement("p", { class: "header__modal-product" }, `${element.name}`)
      const basketPrice = createElement("p", { class: "header__modal-price" }, `${element.price}` + "$");
      basketListItem.append(basketName, basketPrice)
      basketList.append(basketListItem)
   });

   saveData(addedProducts)


   const basketTotalPrice = createElement("p", { class: "header__modal-fullprice" }, "Total: " + totalPrice() + "$");
   const removeAllItem = createElement("button", { class: "header__modal-removeall", id:"removeAll" }, "Remove all items from cart")

   basketButton.onclick = () => {
      document.getElementById("my-modal").classList.remove("open")
      document.getElementById("my-modal").remove()

   }
   removeAllItem.onclick = () => {
      deleteAll()

   }

   header.append(modalBasketWrap);
   modalBasketWrap.append(basketWrap)
   basketWrap.append(basketButton, basketTitle, basketListWrap, removeAllItem)
   basketListWrap.append(basketList,basketTotalPrice)
   basketButton.append(closeBasket)
   return modalBasketWrap
}

// Открыть модальное окно корзина
document.getElementById("open-modal-btn").addEventListener("click", function () {
      printBasket()
   document.getElementById("my-modal").classList.add("open")
})


// Закрыть модальное окно при нажатии на Esc
window.addEventListener('keydown', (e) => {
   if (e.key === "Escape") {
      document.getElementById("my-modal").classList.remove("open")
   }
});


// картинка в модалке
document.getElementById("cards").addEventListener("click", (e) => {
   if (e.target.id === "myImg") {
      const modalImg = document.getElementById("img01");
      document.getElementById("myModal").classList.add("open")
      modalImg.src = e.target.src;
      console.log(e.target.src)
   }
})

// Закрыть модальное окно
document.getElementById("close").addEventListener("click", function () {
   document.getElementById("myModal").classList.remove("open")
})

// Закрыть модальное окно при нажатии на Esc
window.addEventListener('keydown', (e) => {
   if (e.key === "Escape") {
      document.getElementById("myModal").classList.remove("open")
   }
});

// Закрыть модальное окно при клике вне его
document.getElementById("myModal").addEventListener('click', event => {
   if (event._isClickWithInModal) return;
   event.currentTarget.classList.remove('open');
});

// слайдер - подключили библиотеку слик слайдер

   $(document).ready(function () {
      $('.slider').slick({
         arrows: true,
         dots: true,
         slidesToShow: 1,
         responsive: [
            {
               breakpoint: 768,
               settings: {
                  slidesToShow: 1
               }
            },
            {
               breakpoint: 320,
               settings: {
                  slidesToShow: 1
               }
            }
         ]
      });
   });