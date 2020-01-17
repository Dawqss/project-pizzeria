/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
'use strict';

const select = {
  templateOf: {
    menuProduct: '#template-menu-product',
  },
  containerOf: {
    menu: '#product-list',
    cart: '#cart',
  },
  all: {
    menuProducts: '#product-list > .product',
    menuProductsActive: '#product-list > .product.active',
    formInputs: 'input, select',
  },
  menuProduct: {
    clickable: '.product__header',
    form: '.product__order',
    priceElem: '.product__total-price .price',
    imageWrapper: '.product__images',
    amountWidget: '.widget-amount',
    cartButton: '[href="#add-to-cart"]',
  },
  widgets: {
    amount: {
      input: 'input[name="amount"]',
      linkDecrease: 'a[href="#less"]',
      linkIncrease: 'a[href="#more"]',
    },
  },
};

const classNames = {
  menuProduct: {
    wrapperActive: 'active',
    imageVisible: 'active',
  },
};

const settings = {
  amountWidget: {
    defaultValue: 1,
    defaultMin: 1,
    defaultMax: 9,
  }
};

const templates = {
  menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
};

class Product {
  constructor(id, data) {
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    console.log('new product', thisProduct);
  }

  renderInMenu() {
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFrom HTML*/
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /*find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
  }

  initAccordion() {
    const thisProduct = this;


    /* find the clickable trigger (the element that should react to clicking) */
    let clickedElement = thisProduct.accordionTrigger;
    /* START: click event listener to trigger */
    clickedElement.addEventListener('click', function (event) {
      console.log('clicked element', clickedElement);
      /* prevent default action for event */
      event.preventDefault();
      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      /* find all active products */
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
      console.log('found active products: ', activeProducts);
      /* START LOOP: for each active product */
      for (let activeProduct of activeProducts) {
        /* START: if the active product isn't the element of thisProduct */
        if (activeProduct !== thisProduct.element) {
          /* remove class active for the active product */
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
          /* END: if the active product isn't the element of thisProduct */
        }
        /* END LOOP: for each active product */
      }
      /* END: click event listener to trigger */
    });
  }


  initOrderForm() {
    const thisProduct = this;
    console.log(thisProduct);
    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });
  }

  processOrder() {
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.form);
    console.log('formData', formData);
    let price = thisProduct.data.price;

    /*START LOOP: for each paramId in thisProduct.data.params*/
    for (let paramId of thisProduct.data.params) {
      /*save the element in thisProduct.data.params with key paramId as const param */
      const param = thisProduct.data.params[paramId];

      /*START LOOP: for each optionId in param.options*/
      for (let optionId of param.options) {
        /* save the element in param.options with key optionId as const option */
        const option = param.options.element[optionId];
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        /*START IF: if option is selected and option is not default */
        if (optionSelected && !option.default) {
          /* add price of option to variable price  */
          price = price + option.price;
          console.log('new price:', option.price);
          /*END loop: for all param's OPTIONS*/
        } else if
        /* START ELSE IF: if option is not selected and option is default */
        (!optionSelected && option.default) {
          /* deduct price of option from price */
          price = price - option.price;
          console.log('reduced price ', option.price);
        }
        /* END ELSE IF: if option is not selected and option is default */

        thisProduct.priceElem.innerHTML = price;
        console.log('final price', price);
      }
      /* END LOOP: for each optionId in param.options */
    }
    /* END LOOP: for each paramId in thisProduct.data.params */
  }
  /* set the contents of thisProduct.priceElem to be the value of variable price */
}


const app = {
  initMenu: function () {
    const thisApp = this;
    console.log('thisApp.data', thisApp.data);
    for (let productData in thisApp.data.products) {   //nowa instancja dla kazdego produktu
      new Product(productData, thisApp.data.products[productData]);
    }
  },

  initData: function () {
    const thisApp = this;

    thisApp.data = dataSource;
  },

  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initData();

    thisApp.initMenu();
  },
};
app.init();
