import {
  FaShoppingCart,
  FaChartLine,
  FaUserFriends,
  FaClock,
  FaStar,
  FaArrowRight,
  FaPlay,
  FaHeart,
  FaDumbbell,
  FaGraduationCap,
  FaUsers,
} from 'react-icons/fa';
import { FaShield } from 'react-icons/fa6';

const HeroLanding = () => {
  return (
    <div className='min-h-screen bg-linear-(--gradient-primary)'>
      {/* Hero Section */}
      <section className='container mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center'>
        <div className='max-w-4xl mx-auto'>
          <div className='inline-flex items-center space-x-2 bg-info-bg text-text-header px-3 sm:px-4 py-2 rounded-full text-sm font-medium mb-6'>
            <FaStar className='text-warning' />
            <span className='text-xs sm:text-sm'>Hơn 10.000 kế hoạch bữa ăn • Đánh giá 4.9★</span>
          </div>

          <h1 className='text-3xl sm:text-5xl lg:text-6xl font-bold text-text-header mb-6 leading-tight'>
            Lập kế hoạch bữa ăn{' '}
            <span className='text-transparent bg-clip-text bg-linear-(--gradient-text)'>cá nhân hóa bằng AI</span>
          </h1>

          <p className='text-lg sm:text-xl text-text-body mb-8 max-w-2xl mx-auto px-4'>
            Phù hợp khẩu vị, lịch trình và ngân sách. Nhập hồ sơ sức khỏe và sở thích ăn uống. AI gợi ý thực đơn
            ngày/tuần cân bằng dinh dưỡng và chi phí.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 px-4'>
            <button className='w-full sm:w-auto bg-button-bg text-button-text px-6 sm:px-8 py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-button-hover hover:shadow-lg hover:scale-105 transform transition-all duration-200 flex items-center justify-center space-x-2'>
              <span>Tạo kế hoạch bữa ăn trong 30 giây</span>
              <FaArrowRight />
            </button>
            <button className='w-full sm:w-auto border-2 border-border-light text-text-body px-6 sm:px-8 py-4 rounded-xl font-semibold text-base sm:text-lg hover:border-primary hover:text-primary transition-colors flex items-center justify-center space-x-2'>
              <FaPlay />
              <span>Xem demo</span>
            </button>
          </div>

          {/* Hero Visual */}
          <div className='relative max-w-4xl mx-auto px-4'>
            <div className='bg-bg rounded-2xl shadow-2xl p-4 sm:p-8 border border-border-light'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6'>
                <div className='bg-success-bg p-4 sm:p-6 rounded-xl'>
                  <FaHeart className='text-success text-xl sm:text-2xl mb-3' />
                  <h3 className='font-semibold text-text-header mb-2 text-sm sm:text-base'>Cá nhân hóa sâu</h3>
                  <p className='text-text-body text-xs sm:text-sm'>Dựa trên mục tiêu, dị ứng & khẩu vị</p>
                </div>
                <div className='bg-info-bg p-4 sm:p-6 rounded-xl'>
                  <FaShoppingCart className='text-info text-xl sm:text-2xl mb-3' />
                  <h3 className='font-semibold text-text-header mb-2 text-sm sm:text-base'>
                    Danh sách mua sắm tự động
                  </h3>
                  <p className='text-text-body text-xs sm:text-sm'>Tổng hợp nguyên liệu theo ngày/tuần</p>
                </div>
                <div className='bg-warning-bg p-4 sm:p-6 rounded-xl'>
                  <FaChartLine className='text-warning text-xl sm:text-2xl mb-3' />
                  <h3 className='font-semibold text-text-header mb-2 text-sm sm:text-base'>Theo dõi tiến độ</h3>
                  <p className='text-text-body text-xs sm:text-sm'>Calo, vĩ chất, nhắc nhở bữa ăn & nấu nướng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className='py-16 sm:py-20 bg-bg'>
        <div className='container mx-auto px-4 sm:px-6'>
          <div className='text-center mb-12 sm:mb-16'>
            <h2 className='text-3xl sm:text-4xl font-bold text-text-header mb-4'>Cách hoạt động</h2>
            <p className='text-lg sm:text-xl text-text-body'>Chỉ 3 bước đơn giản để có kế hoạch bữa ăn hoàn hảo</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 max-w-5xl mx-auto'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6'>
                <span className='text-primary-contrast font-bold text-xl'>1</span>
              </div>
              <h3 className='text-lg sm:text-xl font-semibold mb-4 text-text-header'>Thiết lập nhanh</h3>
              <p className='text-text-body text-sm sm:text-base'>
                Chiều cao, cân nặng, mục tiêu, món yêu thích & hạn chế
              </p>
            </div>

            <div className='text-center'>
              <div className='w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6'>
                <span className='text-secondary-contrast font-bold text-xl'>2</span>
              </div>
              <h3 className='text-lg sm:text-xl font-semibold mb-4 text-text-header'>Gợi ý thực đơn bằng AI</h3>
              <p className='text-text-body text-sm sm:text-base'>
                Chọn 1 trong 3 gợi ý; tùy chỉnh với thay thế thông minh
              </p>
            </div>

            <div className='text-center'>
              <div className='w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6'>
                <span className='text-secondary-contrast font-bold text-xl'>3</span>
              </div>
              <h3 className='text-lg sm:text-xl font-semibold mb-4 text-text-header'>Mua sắm & Nấu ăn</h3>
              <p className='text-text-body text-sm sm:text-base'>Xuất danh sách mua sắm; nhận nhắc giờ nấu ăn</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id='features' className='py-16 sm:py-20 bg-bg-muted'>
        <div className='container mx-auto px-4 sm:px-6'>
          <div className='text-center mb-12 sm:mb-16'>
            <h2 className='text-3xl sm:text-4xl font-bold text-text-header mb-4'>Phù hợp với mọi người</h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto'>
            <div className='bg-bg p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow'>
              <div className='flex items-center mb-4'>
                <FaGraduationCap className='text-success text-xl sm:text-2xl mr-3' />
                <h3 className='text-lg sm:text-xl font-semibold text-text-header'>Sinh viên & người bận rộn</h3>
              </div>
              <p className='text-text-body mb-4 text-sm sm:text-base'>15-30 phút mỗi bữa, tối ưu chi phí</p>
              <div className='flex items-center text-success text-xs sm:text-sm'>
                <FaClock className='mr-2' />
                <span>Tiết kiệm thời gian & chi phí</span>
              </div>
            </div>

            <div className='bg-bg p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow'>
              <div className='flex items-center mb-4'>
                <FaDumbbell className='text-info text-xl sm:text-2xl mr-3' />
                <h3 className='text-lg sm:text-xl font-semibold text-text-header'>Người yêu thể hình</h3>
              </div>
              <p className='text-text-body mb-4 text-sm sm:text-base'>Vĩ chất rõ ràng, thời điểm bữa ăn thông minh</p>
              <div className='flex items-center text-info text-xs sm:text-sm'>
                <FaChartLine className='mr-2' />
                <span>Theo dõi dinh dưỡng chính xác</span>
              </div>
            </div>

            <div className='bg-bg p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow'>
              <div className='flex items-center mb-4'>
                <FaUsers className='text-secondary text-xl sm:text-2xl mr-3' />
                <h3 className='text-lg sm:text-xl font-semibold text-text-header'>Gia đình</h3>
              </div>
              <p className='text-text-body mb-4 text-sm sm:text-base'>Gợi ý khẩu phần & khẩu vị cho từng thành viên</p>
              <div className='flex items-center text-secondary text-xs sm:text-sm'>
                <FaUserFriends className='mr-2' />
                <span>Phù hợp mọi lứa tuổi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className='py-16 sm:py-20 bg-bg-alt'>
        <div className='container mx-auto px-4 sm:px-6 text-center'>
          <div className='max-w-3xl mx-auto'>
            <FaShield className='text-3xl sm:text-4xl text-primary mx-auto mb-6' />
            <h2 className='text-2xl sm:text-3xl font-bold text-text-header mb-6'>Dữ liệu của bạn được bảo mật</h2>
            <p className='text-lg sm:text-xl text-text-body'>
              Dữ liệu sức khỏe được mã hóa và chỉ dùng cho lập kế hoạch bữa ăn cá nhân hóa. Bạn có toàn quyền xuất hoặc
              xóa dữ liệu bất cứ lúc nào.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id='faq' className='py-16 sm:py-20 bg-bg'>
        <div className='container mx-auto px-4 sm:px-6'>
          <div className='text-center mb-12 sm:mb-16'>
            <h2 className='text-3xl sm:text-4xl font-bold text-text-header mb-4'>Câu hỏi thường gặp</h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto'>
            <div className='bg-bg-alt p-4 sm:p-6 rounded-xl'>
              <h3 className='font-semibold text-text-header mb-3 text-sm sm:text-base'>Tôi không biết nấu ăn?</h3>
              <p className='text-text-body text-xs sm:text-sm'>
                Mỗi công thức đều có hướng dẫn từng bước và thời gian nấu ước tính.
              </p>
            </div>

            <div className='bg-bg-alt p-4 sm:p-6 rounded-xl'>
              <h3 className='font-semibold text-text-header mb-3 text-sm sm:text-base'>
                Dị ứng/hạn chế ăn uống thì sao?
              </h3>
              <p className='text-text-body text-xs sm:text-sm'>
                Đánh dấu một lần, AI sẽ tự động loại trừ trong mọi gợi ý sau này.
              </p>
            </div>

            <div className='bg-bg-alt p-4 sm:p-6 rounded-xl'>
              <h3 className='font-semibold text-text-header mb-3 text-sm sm:text-base'>
                Có làm tăng chi phí ăn uống không?
              </h3>
              <p className='text-text-body text-xs sm:text-sm'>
                Chúng tôi có chế độ tối ưu ngân sách giúp kiểm soát và giảm chi tiêu mua sắm.
              </p>
            </div>

            <div className='bg-bg-alt p-4 sm:p-6 rounded-xl'>
              <h3 className='font-semibold text-text-header mb-3 text-sm sm:text-base'>Có dùng offline được không?</h3>
              <p className='text-text-body text-xs sm:text-sm'>
                Có! Ứng dụng PWA cho phép xem kế hoạch bữa ăn và danh sách mua sắm khi không có internet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className='py-16 sm:py-20 bg-linear-(--gradient-primary)'>
        <div className='container mx-auto px-4 sm:px-6 text-center'>
          <div className='max-w-3xl mx-auto text-primary'>
            <h2 className='text-3xl sm:text-4xl font-bold mb-6'>Sẵn sàng ăn đúng cách, sống tốt hơn?</h2>
            <p className='text-lg sm:text-xl mb-8 opacity-90'>
              Tham gia cùng hơn 10.000 người đã thay đổi thói quen ăn uống với Hero
            </p>

            <button className='bg-bg text-primary px-6 sm:px-8 py-4 rounded-xl font-semibold text-base sm:text-lg hover:shadow-lg transform hover:scale-105 transition-all flex items-center space-x-2 mx-auto'>
              <span>Bắt đầu miễn phí hôm nay</span>
              <FaArrowRight />
            </button>

            <p className='text-xs sm:text-sm opacity-75 mt-4'>Không cần thẻ tín dụng • Hủy bất cứ lúc nào</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroLanding;
