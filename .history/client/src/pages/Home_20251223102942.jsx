import React from 'react'

import MainBanner from '../components/MainBanner'

import BestSeller from '../components/BestSeller'
import BottomBanner from '../components/BottomBanner'
import NewsLetter from '../components/NewsLetter'
import OurStory from '../components/OurStory'
import Reviews from '../components/Reviews'
import Categories from '../components/Categories'
import FloatingButtons from '../components/FloatingButtons'

export default function() {
  return (
   <>
   <div className='mt-10'>
    <MainBanner/>
 <Categories/>
    <BestSeller/>
    <OurStory/>
   <Reviews/>
  <FloatingButtons/>
   </div>
   </>
  )
}
