làm dùm mình 1 web bán hũ chân gà sả tắc, 
người bán hàng là Mami Tú Anh, sử dụng hình tu-anh.jpg làm ảnh đại diện của shop.
giao diện tối ưu cho mobile, sử dụng hình trong folder /materials

sản phẩm sẽ là 2 hình có dạng slider lướt qua lại, thêm 2 mũi tên qua lại để người dùng có thể bấm xem từng ảnh lướt qua lướt lại.
dưới sản phẩm có nút đặt hàng, bấm chọn số lượng -> button Đặt hàng.
giá mỗi sản phẩm sẽ có là 130000vnd, nếu đặt 2 hũ thì nhân đôi, cứ thế mà tính.

trang đặt hàng sẽ gồm form nhập tên, số điện thoại, địa chỉ giao hàng -> submit xong sẽ tới trang thanhh toán, hiện mã qr code sau:

https://img.vietqr.io/image/970415-113366668888-compact.png


các thông tin liên hệ ở footer gồm số diện thoại: 0909222333, facebook: m.me/MamiCuO

tạo dùm mình một danh trang danh sách mua hàng (order.html), sẽ gồm tên, số diện thoại, số lượng đặt, thành tiền, địa chỉ nhận hàng (của người dùng đã nhập trước đó).

phần navigation: sẽ có là Trang chủ > Sản phẩm > Thông tin giao hàng > Thanh toán.


các yêu cầu khác:
ở form nhập số địen thoại, hãy thêm phần validation, bắt buộc phải nhập đủ 10 số diện thoại, chỉ được nhập số mà thôi.
phần nội dung chuyển khoản: hãy để theo cấu trúc: <tên của người dùng> - <số điện thoại>,ví dụ: Quoc Hung - 0909222333, các dấu cần bị loại bỏ, phải sử dụng không dấu



phần tài khoản, bạn thay đổi hình mã qr thành hình với cấu trúc như sau:

https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>

BANK_ID: mã ngân hàng
ACCOUNT_NO: số tài khoản
TEMPLATE: compact hoặc default
AMOUNT: số tiền
DESCRIPTION: mô tả
ACCOUNT_NAME: tên tài khoản

thông tin cần thêm vào:
Bank ID: VAB
Account No: 00125223
Template: compact
Amount: <số tiền mà khách hàng chọn>, ví dụ 790000
Description: <Tên + số diện thoại khách hàng> (viết không dấu)
Account Name: Nguyen Thi Tu Anh

ví dụ: https://img.vietqr.io/image/VAB-00125223-compact.png?amount=790000&addInfo=Quoc%20Hung%20-%200909222333&accountName=Nguyen%20Thi%20Tu%20Anh


ở dưới mã QR ban thêm dùm thông tin chuyển khoản để người dùng có thể chuyển khoản thủ công, gồm:
Số tài khoản: 00125223
Chủ tài khoản: Nguyễn Thị Tú Anh (viết không dấu)
Ngân hàng: VietABank   
số tiền: <số tiền mà khách hàng chọn>, ví dụ 790000
nội dung: <Tên + số diện thoại khách hàng> (viết không dấu)

y chang như ở mã qr, nhưng hiện ra, có thêm nút copy ở kế bên để dễ dàng copy
