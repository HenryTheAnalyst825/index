document.addEventListener('DOMContentLoaded', () => {
    // Tải giỏ hàng từ localStorage
    cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Kiểm tra trang hiện tại và khởi tạo tương ứng
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'home.html' || currentPage === '' || currentPage === 'Petfood store.html') {
        generateProducts();
        renderProductGrid('featured-products', allProducts.filter(p => p.popularity > 85).slice(0, 6));
    } else if (currentPage === 'products.html') {
        const savedSort = localStorage.getItem('sortPreference') || 'default';
        document.getElementById('sort-select').value = savedSort;
        generateProducts();
        sortProducts();
    } else if (currentPage === 'cart.html') {
        renderCart();
    }

    // VNPay
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('paymentStatus');
    const txnRef = urlParams.get('txnRef');
    if (paymentStatus && txnRef) {
        const messageEl = document.getElementById('payment-message');
        if (paymentStatus === 'success') {
            // Tin nhắn thành công
            messageEl.textContent = `Thanh toán thành công! Mã giao dịch: ${txnRef} 🐾`;
            messageEl.className = 'confirmation-message mt-3 text-success';
            cart = [];
            saveCart();
            renderCart();
        } else {
            // Tin nhắn fail
            messageEl.textContent = 'Thanh toán thất bại. Vui lòng thử lại.';
            messageEl.className = 'confirmation-message mt-3 text-danger';
        }
        // Xóa mã
        window.history.replaceState({}, document.title, '/');
    }

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const icon = this.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });

    // Back to top button
    window.addEventListener('scroll', function() {
        const backToTop = document.getElementById('back-to-top');
        if (window.scrollY > 300) {
            backToTop.style.display = 'block';
        } else {
            backToTop.style.display = 'none';
        }
    });

    document.getElementById('back-to-top').addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Cleanup modal khi đóng hoàn toàn
    const productModal = document.getElementById('productModal');
    if (productModal) {
        productModal.addEventListener('hidden.bs.modal', function () {
            // Đảm bảo xóa hết backdrop và reset body style
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            // Xóa tất cả backdrop còn sót
            document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
        });
    }
});
/* Part 3: Liên kết sp với giỏ */
const baseProducts = [
    {
        baseName: 'Thức ăn cho chó',
        shortName: 'cho',
        category: 'food-dog',
        description: 'Thức ăn cao cấp cho chó với protein 28%, chất béo 15%, chất xơ 4%. Thành phần: Gà, gạo lứt, khoai lang, đậu, dầu cá.',
        price: 500000,
        image: 'imagespetfud/cho_1.png',
        popularity: 80,
        discount: 0,
        createdDate: '2025-10-01'
    },{
        baseName: 'Thức ăn cho mèo',
        shortName: 'meo',
        category: 'food-cat',
        description: 'Thức ăn giàu dinh dưỡng cho mèo với protein 30%, chất béo 12%, chất xơ 3%. Thành phần: Cá hồi, gà, gạo, nam việt quất, taurine.',
        price: 400000,
        image: 'imagespetfud/Ins.jpg',
        popularity: 90,
        discount: 10,
        createdDate: '2025-09-15'
    },{
        baseName: 'Đồ ăn vặt cho thú cưng',
        shortName: 'pets',
        category: 'snacks',
        description: 'Đồ ăn vặt không hạt, protein 20%, chất béo 5%. Thành phần: Gà, khoai lang, bí đỏ, canxi.',
        price: 250000,
        image: 'imagespetfud/yt.jpg',
        popularity: 70,
        discount: 5,
        createdDate: '2025-10-05'
    },];
let allProducts = [];
let currentProducts = [];
let currentPage = 1;
const productsPerPage = 9;
let cart = [];
function generateProducts() {
    allProducts = [];
    const flavors = ['Gà', 'Cá hồi', 'Thịt bò', 'Cá ngừ'];
    
    // Giảm từ 12 xuống 6 iterations để tạo 18 sản phẩm thay vì 36
    for (let i = 0; i < 6; i++) {
        baseProducts.forEach((base) => {
            const flavor = flavors[i % flavors.length];
            allProducts.push({
                id: allProducts.length + 1,
                name: `${base.baseName} - ${flavor} ${i + 1}`,
                category: base.category,
                description: base.description,
                price: base.price + (i * 50000),
                image: `imagespetfud/${base.shortName}_${i + 1}.png`,
                popularity: base.popularity + (Math.random() * 20 - 10),
                discount: i % 3 === 0 ? 10 : i % 5 === 0 ? 5 : 0,
                createdDate: new Date(2025, 9, 1 - i).toISOString().split('T')[0]
            });
        });
    }
    
    currentProducts = [...allProducts];
    // Kết xuất lưới sản phẩm ban đầu
    renderProductGrid('all-products', currentProducts.slice(0, productsPerPage));
    renderProductGrid('featured-products', allProducts.filter(p => p.popularity > 85).slice(0, 6));
    updateProductCount();
}
// Kết xuất sản phẩm trong lưới bằng cách sử dụng thẻ Bootstrap
function renderProductGrid(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Dọn sạch và chuẩn bị thùng chứa với lớp mờ dần
    container.innerHTML = '';
    container.classList.add('fade-in');
    
    const fragment = document.createDocumentFragment();
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'col-sm-6 col-md-4 col-lg-3';
        card.innerHTML = `
            <div class="card product-card h-100" data-category="${product.category}" onclick="showProductModal(${product.id})" style="cursor: pointer;">
                <img src="${product.image}" class="card-img-top mx-auto" alt="${product.name}" style="cursor: pointer;">
                <div class="card-body text-center">
                    <h4 class="card-title">${product.name}</h4>
                    <p class="card-text">${product.description}</p>
                    <p class="card-text">Giá: ${product.price.toLocaleString()} VNĐ${product.discount > 0 ? ` <span class="text-danger">(-${product.discount}%)</span>` : ''}</p>
                    <button class="btn btn-primary" onclick="event.stopPropagation(); showProductModal(${product.id})" aria-label="Xem chi tiết ${product.name}">Thêm vào giỏ</button>
                </div>
            </div>`;
        fragment.appendChild(card);
    });
    
    container.appendChild(fragment);
}
/* Part 4: Forms and UI Interactions */
// Show a specific page and highlight active menu item (for single-page app, but now adapted for multi-page)
function showPage(pageId) {
    // Since we now have separate pages, redirect to the appropriate page
    const pageMap = {
        'home': 'home.html',
        'products': 'products.html',
        'contact': 'contact-account.html',
        'account': 'contact-account.html',
        'cart': 'cart.html'
    };
    if (pageMap[pageId]) {
        window.location.href = pageMap[pageId];
    }
}
// Filter products by search query
function changeModalQuantity(delta) {
    const quantityInput = document.getElementById('modal-quantity');
    let currentQuantity = parseInt(quantityInput.value);
    currentQuantity += delta;
    if (currentQuantity < 1) currentQuantity = 1;
    quantityInput.value = currentQuantity;
}

function showProductModal(id) {
  const product = allProducts.find(p => p.id == id);
  if (!product) return;

  const modalElement = document.getElementById('productModal');
  
  // Đóng modal cũ nếu đang mở (tránh multiple instances)
  const existingModal = bootstrap.Modal.getInstance(modalElement);
  if (existingModal) {
    existingModal.hide();
  }

  // Gán dữ liệu vào modal
  document.getElementById('modal-product-image').src = product.image;
  document.getElementById('modal-product-name').textContent = product.name;
  document.getElementById('modal-product-description').textContent = product.description;
  document.getElementById('modal-product-price').textContent = product.price.toLocaleString();
  document.getElementById('modal-product-discount').textContent = product.discount ? `(-${product.discount}%)` : '';
  document.getElementById('modal-quantity').value = 1;

  // Khi nhấn nút "Thêm vào giỏ"
  document.getElementById('modal-add-to-cart').onclick = function () {
    const quantity = parseInt(document.getElementById('modal-quantity').value);
    const existing = cart.find(c => c.id === String(product.id));

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id: String(product.id), quantity });
    }

    saveCart();
    renderCart();

    // Đóng modal và cleanup
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }

    // Hiện thông báo
    alert(`${product.name} đã được thêm vào giỏ hàng (${quantity} sản phẩm)!`);
  };

  // Hiển thị modal mới
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function renderCart() {
  const list = document.getElementById("cart-list");
  if (!list) return; // Nếu chưa vào trang giỏ hàng thì thoát

  const noteSection = document.getElementById("note-section");
  const invoiceSection = document.getElementById("invoice-section");
  const totalEl = document.getElementById("total");
  const cartCountEl = document.getElementById("cart-count");

  let total = 0;

  if (cart.length === 0) {
    list.innerHTML = `<p class="text-muted">Giỏ hàng của bạn đang trống.</p>`;
    if (noteSection) noteSection.style.display = "none";
    if (invoiceSection) invoiceSection.style.display = "none";
    if (totalEl) totalEl.textContent = "0đ";
    if (cartCountEl) cartCountEl.textContent = 0;
    return;
  }

  // Tạo HTML một lần thay vì nhiều lần
  const cartItemsHTML = cart.map((item, index) => {
    const product = allProducts.find(p => p.id == item.id);
    if (!product) return '';

    const itemTotal = product.price * item.quantity;
    total += itemTotal;

    return `
      <div class="d-flex align-items-center border-bottom py-3">
        <img src="${product.image}" alt="${product.name}" class="rounded me-3" style="width:80px; height:80px; object-fit:cover;">
        <div class="flex-grow-1">
          <h6 class="mb-1">${product.name}</h6>
          <p class="text-danger mb-2">${product.price.toLocaleString()}đ</p>
          <div class="d-flex align-items-center">
            <button class="btn btn-outline-secondary btn-sm" onclick="changeQuantity(${index}, -1)">-</button>
            <input type="text" class="form-control form-control-sm mx-2 text-center" value="${item.quantity}" readonly style="width:50px;">
            <button class="btn btn-outline-secondary btn-sm" onclick="changeQuantity(${index}, 1)">+</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  list.innerHTML = cartItemsHTML;

  if (totalEl) totalEl.textContent = total.toLocaleString() + "đ";
  if (cartCountEl) cartCountEl.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
  if (noteSection) noteSection.style.display = "block";
  if (invoiceSection) invoiceSection.style.display = "block";
}


function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
}
function changeQuantity(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        removeFromCart(index);
    } else {
        saveCart();
        renderCart();
    }
}
function checkout() {
    if (cart.length === 0) {
        alert('Giỏ hàng trống!');
        return;}
    let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const messageEl = document.getElementById('payment-message');
    // Simulate payment success for demo
    messageEl.textContent = `Thanh toán thành công! Tổng: ${total.toLocaleString()} VNĐ 🐾`;
    messageEl.className = 'confirmation-message mt-3 text-success';
    cart = [];
    saveCart();
    renderCart();
}
// Filter products by search query with debounce
let filterTimeout;
function filterProducts() {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => {
        const query = document.getElementById('search').value.toLowerCase();
        currentProducts = allProducts.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
        currentPage = 1;
        renderProductsPage();
    }, 300);
}
// Filter products by category
function filterByCategory(category) {
    currentProducts = category === 'all' ? [...allProducts] : allProducts.filter(p => p.category === category);
    currentPage = 1;
    renderProductsPage();
}
// Sort products based on select option
function sortProducts() {
    const sortValue = document.getElementById('sort-select').value;
    const feedback = document.getElementById('sort-feedback');
    const sortLabels = {
        'default': 'Mặc định',
        'price-low': 'Giá thấp đến cao',
        'price-high': 'Giá cao đến thấp',
        'name-asc': 'Tên A-Z',
        'name-desc': 'Tên Z-A',
        'popular': 'Phổ biến',
        'discount': 'Giảm giá',
        'newest': 'Mới nhất'
    };
    feedback.textContent = `Đang sắp xếp theo: ${sortLabels[sortValue]}`;
    feedback.classList.add('active');
    localStorage.setItem('sortPreference', sortValue);
    // Sort products based on selected criteria
    currentProducts.sort((a, b) => {
        switch (sortValue) {
            case 'price-low': return a.price - b.price;
            case 'price-high': return b.price - a.price;
            case 'name-asc': return a.name.localeCompare(b.name);
            case 'name-desc': return b.name.localeCompare(a.name);
            case 'popular': return b.popularity - a.popularity;
            case 'discount': return b.discount - a.discount;
            case 'newest': return new Date(b.createdDate) - new Date(a.createdDate);
            default: return a.id - b.id;
        }
    });
    renderProductsPage();
}
// Render products page with pagination
function renderProductsPage() {
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const pageProducts = currentProducts.slice(start, end);
    renderProductGrid('all-products', pageProducts);
    document.getElementById('page-info').textContent = `Trang ${currentPage} / ${Math.ceil(currentProducts.length / productsPerPage)}`;
    updateProductCount();
}
// Change page for pagination
function changePage(direction) {
    const maxPage = Math.ceil(currentProducts.length / productsPerPage);
    currentPage += direction;
    currentPage = Math.max(1, Math.min(currentPage, maxPage));
    renderProductsPage();
}
// Update product count displays
function updateProductCount() {
    document.getElementById('product-count-products').textContent = currentProducts.length;
}
function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const messageEl = document.getElementById('login-message');
    // For formality, always success without saving data
    messageEl.textContent = 'Đăng nhập thành công!';
    messageEl.className = 'confirmation-message mt-3 text-success';
    setTimeout(() => showPage('home'), 1000);
}
function signup() {
    const email = document.getElementById('signup-email').value.trim();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    const confirmPassword = document.getElementById('signup-confirm-password').value.trim();
    const messageEl = document.getElementById('signup-message');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        messageEl.textContent = 'Vui lòng nhập email hợp lệ.';
        messageEl.className = 'confirmation-message mt-3 text-danger';
        return;
    }
    if (!username || username.length < 3) {
        messageEl.textContent = 'Tên đăng nhập phải có ít nhất 3 ký tự.';
        messageEl.className = 'confirmation-message mt-3 text-danger';
        return;
    }
    if (!password || password.length < 6) {
        messageEl.textContent = 'Mật khẩu phải có ít nhất 6 ký tự.';
        messageEl.className = 'confirmation-message mt-3 text-danger';
        return;
    }
    if (password !== confirmPassword) {
        messageEl.textContent = 'Mật khẩu xác nhận không khớp.';
        messageEl.className = 'confirmation-message mt-3 text-danger';
        return;
    }
    messageEl.textContent = 'Đăng ký thành công! Chuyển đến đăng nhập...';
    messageEl.className = 'confirmation-message mt-3 text-success';
    setTimeout(() => showPage('home'), 1000); 
}
function toggleAccountMode(mode) {
    const loginSection = document.getElementById('login-section');
    const signupSection = document.getElementById('signup-section');
    const toggleLoginBtn = document.getElementById('toggle-login');
    const toggleSignupBtn = document.getElementById('toggle-signup');
    if (mode === 'login') {
        loginSection.style.display = 'block';
        signupSection.style.display = 'none';
        toggleLoginBtn.classList.add('active');
        toggleSignupBtn.classList.remove('active');
    } else {
        loginSection.style.display = 'none';
        signupSection.style.display = 'block';
        toggleLoginBtn.classList.remove('active');
        toggleSignupBtn.classList.add('active');
    }
}
function submitContactForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const confirmation = document.getElementById('contact-confirmation');
    if (!name || !email || !message) {
        confirmation.textContent = 'Vui lòng điền đầy đủ thông tin.';
        confirmation.className = 'confirmation-message mt-3 text-danger';
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        confirmation.textContent = 'Vui lòng nhập email hợp lệ.';
        confirmation.className = 'confirmation-message mt-3 text-danger';
        return;
    }
    confirmation.textContent = 'Cảm ơn tin nhắn của bạn! Chúng tôi sẽ liên hệ sớm.';
    confirmation.className = 'confirmation-message mt-3 text-success';
    document.getElementById('contact-form').reset();
}




document.getElementById("checkoutBtn")?.addEventListener("click", () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const warning = document.getElementById("login-warning");
  if (!warning) return;

  warning.style.display = "none";

  if (cart.length === 0) {
    alert("Giỏ hàng của bạn đang trống, vui lòng chọn sản phẩm trước khi thanh toán!");
    return;
  }

  // Nếu có logic đăng nhập thì kiểm tra, ở đây giả lập:
  warning.style.display = "block";
});

const addressData = {
  "TP. Hồ Chí Minh": {
    "Phú Nhuận": ["Phường 1", "Phường 2", "Phường 9"],
    "Quận 1": ["Bến Nghé", "Bến Thành", "Đa Kao"],
    "Gò Vấp": ["Phường 5", "Phường 8", "Phường 15"]
  },
  "Hà Nội": {
    "Ba Đình": ["Phúc Xá", "Ngọc Hà", "Kim Mã"],
    "Cầu Giấy": ["Dịch Vọng", "Nghĩa Tân", "Quan Hoa"]
  },
  "Đà Nẵng": {
    "Hải Châu": ["Thạch Thang", "Hòa Thuận Tây"],
    "Sơn Trà": ["Phước Mỹ", "An Hải Bắc"]
  }
};

function loadDistricts() {
  const city = document.getElementById("city").value;
  const districtSelect = document.getElementById("district");
  districtSelect.innerHTML = '<option value="">-- Chọn Quận/Huyện --</option>';
  document.getElementById("ward").innerHTML = '<option value="">-- Chọn Phường/Xã --</option>';
  if (city && addressData[city]) {
    for (const district in addressData[city]) {
      districtSelect.innerHTML += `<option value="${district}">${district}</option>`;
    }
  }
}

function loadWards() {
  const city = document.getElementById("city").value;
  const district = document.getElementById("district").value;
  const wardSelect = document.getElementById("ward");
  wardSelect.innerHTML = '<option value="">-- Chọn Phường/Xã --</option>';
  if (city && district && addressData[city][district]) {
    addressData[city][district].forEach(ward => {
      wardSelect.innerHTML += `<option value="${ward}">${ward}</option>`;
    });
  }
}

