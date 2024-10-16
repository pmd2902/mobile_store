var currentuser;
var selectedProducts = {}; 
window.onload = function () {
  khoiTao();

  autocomplete(document.getElementById("search-box"), list_products);

  var tags = ["Samsung", "iPhone", "Huawei", "Oppo", "Mobi"];
  for (var t of tags) addTags(t, "index.html?search=" + t);

  currentuser = getCurrentUser();
  addProductToTable(currentuser);
};

function updateTotalPrice(masp, thanhtien) {
  var checkbox = document.getElementById("masp_" + masp);

  if (checkbox.checked) {
    selectedProducts[masp] = thanhtien;
  } else {
    delete selectedProducts[masp];
  }

  var totalSelectedPrice = 0;
  for (var key in selectedProducts) {
    if (selectedProducts.hasOwnProperty(key)) {
      totalSelectedPrice += selectedProducts[key];
    }
  }
  document.getElementById("total-price").innerText =
    numToString(totalSelectedPrice) + " ₫";
}

function checkAll(checkbox) {
  var checkboxes = document.querySelectorAll(
    'input[type="checkbox"][id^="masp"]'
  );
  var totalSelectedPrice = 0; 
  checkboxes.forEach(function (cb) {
    cb.checked = checkbox.checked;
    var masp = cb.id.replace("masp-", "");

    if (cb.checked) {
      var thanhtien = parseFloat(cb.getAttribute("data-price"));
      selectedProducts[masp] = thanhtien;
	  for (var i = 0; i < currentuser.products.length; i++) {
		var masp = currentuser.products[i].ma;
		var soluongSp = currentuser.products[i].soluong;
		var p = timKiemTheoMa(list_products, masp);
		var price = p.promo.name == "giareonline" ? p.promo.value : p.price;
		var thanhtien = stringToNum(price) * soluongSp;
		totalSelectedPrice += thanhtien;
	  }
    } else {
      delete selectedProducts[masp];
	  totalSelectedPrice = 0;
    }
  });
  document.getElementById("total-price").innerText =
    numToString(totalSelectedPrice / currentuser.products.length) + " ₫";
}

function addProductToTable(user) {
  var table = document.getElementsByClassName("listSanPham")[0];

  var s = `
		<tbody>
			<tr>
			    <th>ㅤ
				<input type="checkbox" id="all" onclick="checkAll(this)">
				ㅤ
				</th>
				<th>Sản phẩm</th>
				<th>Giá</th>
				<th>Số lượng</th>
				<th>Thành tiền</th>
				<th>Thời gian</th>
				<th>Xóa</th>
			</tr>`;

  if (!user) {
    s += `
			<tr>
				<td colspan="7"> 
					<h1 style="color:red; background-color:white; font-weight:bold; text-align:center; padding: 15px 0;">
						Bạn chưa đăng nhập !!
					</h1> 
				</td>
			</tr>
		`;
    table.innerHTML = s;
    return;
  } else if (user.products.length == 0) {
    s += `
			<tr>
				<td colspan="7"> 
					<h1 style="color:green; background-color:white; font-weight:bold; text-align:center; padding: 15px 0;">
						Giỏ hàng trống !!
					</h1> 
				</td>
			</tr>
		`;
    table.innerHTML = s;
    return;
  }

  var totalPrice = 0;
  for (var i = 0; i < user.products.length; i++) {
    var masp = user.products[i].ma;
    var soluongSp = user.products[i].soluong;
    var p = timKiemTheoMa(list_products, masp);
    var price = p.promo.name == "giareonline" ? p.promo.value : p.price;
    var thoigian = new Date(user.products[i].date).toLocaleString();
    var thanhtien = stringToNum(price) * soluongSp;

    s += `
		<tr>
		<td> <input type="checkbox" id="masp_${masp}" onclick="updateTotalPrice('${masp}', ${thanhtien})"> </td>
		<td class="noPadding imgHide">
			<a target="_blank" href="chitietsanpham.html?${p.name
        .split(" ")
        .join("-")}" title="Xem chi tiết">
				${p.name}
				<img src="${p.img}">
			</a>
		</td>
		<td class="alignRight">${price} ₫</td>
		<td class="soluong" >
			<button onclick="giamSoLuong('${masp}')"><i class="fa fa-minus"></i></button>
			<input size="1" onchange="capNhatSoLuongFromInput(this, '${masp}')" value="${soluongSp}">
			<button onclick="tangSoLuong('${masp}')"><i class="fa fa-plus"></i></button>
		</td>
		<td class="alignRight">${numToString(thanhtien)} ₫</td>
		<td style="text-align: center">${thoigian}</td>
		<td class="noPadding"> <i class="fa fa-trash" onclick="xoaSanPhamTrongGioHang(${i})"></i> </td>
	</tr>
		`;
  }

  s += `
			<tr style="font-weight:bold; text-align:center">
				<td colspan="4">TỔNG TIỀN: </td>
				<td class="alignRight" id="total-price">0 ₫</td>
				<td class="thanhtoan" onclick="thanhToan()"> Thanh Toán </td>
				<td class="xoaHet" onclick="xoaHet()"> Xóa hết </td>
			</tr>
		</tbody>
	`;

  table.innerHTML = s;
}

function xoaSanPhamTrongGioHang(i) {
  if (window.confirm("Xác nhận hủy mua")) {
    currentuser.products.splice(i, 1);
    capNhatMoiThu();
  }
}

function thanhToan() {
  var c_user = getCurrentUser();
  if (c_user.off) {
    alert("Tài khoản của bạn hiện đang bị khóa nên không thể mua hàng!");
    addAlertBox(
      "Tài khoản của bạn đã bị khóa bởi Admin.",
      "#aa0000",
      "#fff",
      10000
    );
    return;
  }

  var selectedProducts = [];
  for (var i = 0; i < currentuser.products.length; i++) {
    var masp = currentuser.products[i].ma;
    var checkbox = document.getElementById("masp_" + masp);
    if (checkbox && checkbox.checked) {
      selectedProducts.push(currentuser.products[i]);
    }
  }

  if (!selectedProducts.length) {
    addAlertBox(
      "Không có mặt hàng nào được chọn để thanh toán!",
      "#ffb400",
      "#fff",
      2000
    );
    return;
  }

  if (window.confirm("Thanh toán giỏ hàng?")) {
    currentuser?.donhang?.push({
      sp: selectedProducts,
      ngaymua: new Date(),
      tinhTrang: "Đang chờ xử lý",
    });

    currentuser.products = currentuser.products.filter(function (product) {
      return !selectedProducts.includes(product);
    });

    capNhatMoiThu();
    addAlertBox(
      "Các sản phẩm đã được gửi vào đơn hàng và chờ xử lý.",
      "#17c671",
      "#fff",
      4000
    );
  }
}

function xoaHet() {
  if (currentuser.products.length) {
    if (window.confirm("Bạn có chắc chắn muốn xóa hết sản phẩm trong giỏ !!")) {
      currentuser.products = [];
      capNhatMoiThu();
    }
  }
}

function capNhatSoLuongFromInput(inp, masp) {
  var soLuongMoi = Number(inp.value);
  if (!soLuongMoi || soLuongMoi <= 0) soLuongMoi = 1;

  for (var p of currentuser.products) {
    if (p.ma == masp) {
      p.soluong = soLuongMoi;
    }
  }

  capNhatMoiThu();
}

function tangSoLuong(masp) {
  for (var p of currentuser.products) {
    if (p.ma == masp) {
      p.soluong++;
    }
  }

  capNhatMoiThu();
}

function giamSoLuong(masp) {
  for (var p of currentuser.products) {
    if (p.ma == masp) {
      if (p.soluong > 1) {
        p.soluong--;
      } else {
        return;
      }
    }
  }

  capNhatMoiThu();
}

function capNhatMoiThu() {
  animateCartNumber();
  setCurrentUser(currentuser);
  updateListUser(currentuser);
  addProductToTable(currentuser);
  capNhat_ThongTin_CurrentUser();
}
