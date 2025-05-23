import '../styles/Testimonials.css';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';

import { StarIcon } from '@heroicons/react/24/solid';
import { testimonials } from './Data';

function Testimonial() {
  return (
    <section className="testimonials">
      <div className="text-center info">
        <h3>Testimonials</h3>
        <p>
          Hear directly from the people whose lives have been impacted by <b>Smart-Life Care</b>. Our commitment to fast, reliable, and compassionate ambulance services makes a real difference every day.
        </p>
      </div>

      <div className="testimonial-slider-container">
        <Swiper
          modules={[Pagination, Autoplay, Navigation]}
          loop={true}
          speed={500}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          slidesPerView={1}
          pagination={{ clickable: true }}
          navigation
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.name}>
              <div className="testimonial-item">
                <div className="testimonial-header">
                  <img src={testimonial.src} alt={testimonial.name} className="testimonial-img" />
                  <div>
                    <h3>{testimonial.name}</h3>
                    <h4>{testimonial.job}</h4>
                    <div className="stars">
                      {[...Array(5)].map((_, index) => (
                        <StarIcon key={index} className="h-5 w-5 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p>
                  <i className="text-2xl text-gray-400 mr-2">&#8220;</i>
                  <span>{testimonial.comment}</span>
                  <i className="text-2xl text-gray-400 ml-2">&#8221;</i>
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export default Testimonial;
