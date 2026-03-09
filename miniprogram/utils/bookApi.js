/**
 * 图书信息 API 工具类
 * 使用免费的第三方 API 获取图书信息
 */

const DOUBAN_API_BASE = 'https://api.douban.com'
const GOOGLE_BOOKS_API_BASE = 'https://www.googleapis.com/books/v1'

/**
 * 通过 ISBN 获取图书信息
 * @param {string} isbn - ISBN 条形码
 * @returns {Promise<Object>} 图书信息对象
 */
async function getBookByISBN(isbn) {
  try {
    // 尝试使用豆瓣 API（需要 API Key）
    // 如果没有 API Key，可以使用其他免费 API
    
    // 方案 1: 豆瓣 API（推荐，但需要申请 API Key）
    const doubanResult = await fetchFromDouban(isbn)
    if (doubanResult) {
      return doubanResult
    }

    // 方案 2: Google Books API（免费，无需 Key）
    const googleResult = await fetchFromGoogleBooks(isbn)
    if (googleResult) {
      return googleResult
    }

    // 方案 3: 开放图书馆 API（免费）
    const openLibraryResult = await fetchFromOpenLibrary(isbn)
    if (openLibraryResult) {
      return openLibraryResult
    }

    return null
  } catch (error) {
    console.error('获取图书信息失败:', error)
    throw error
  }
}

/**
 * 从豆瓣 API 获取图书信息
 */
async function fetchFromDouban(isbn) {
  // 注意：豆瓣 API 需要 API Key，请自行申请
  const apiKey = 'YOUR_DOUBAN_API_KEY' // 替换为你的 API Key
  
  try {
    const response = await wx.request({
      url: `${DOUBAN_API_BASE}/v2/book/isbn/${isbn}`,
      data: {
        apikey: apiKey
      },
      method: 'GET'
    })

    if (response.statusCode === 200 && response.data) {
      const book = response.data
      return {
        title: book.title,
        author: book.author?.join(', ') || '',
        publisher: book.publisher,
        isbn: book.isbn13,
        cover: book.image,
        summary: book.summary,
        price: book.price,
        pages: book.pages,
        pubdate: book.pubdate
      }
    }
  } catch (error) {
    console.log('豆瓣 API 获取失败，尝试其他方式')
  }
  
  return null
}

/**
 * 从 Google Books API 获取图书信息
 */
async function fetchFromGoogleBooks(isbn) {
  try {
    const response = await wx.request({
      url: `${GOOGLE_BOOKS_API_BASE}/volumes?q=isbn:${isbn}`,
      method: 'GET'
    })

    if (response.statusCode === 200 && response.data.totalItems > 0) {
      const bookInfo = response.data.items[0].volumeInfo
      
      return {
        title: bookInfo.title,
        author: bookInfo.authors?.join(', ') || '',
        publisher: bookInfo.publisher || '',
        isbn: isbn,
        cover: bookInfo.imageLinks?.thumbnail || bookInfo.imageLinks?.smallThumbnail || '',
        summary: bookInfo.description || '',
        pages: bookInfo.pageCount || 0,
        pubdate: bookInfo.publishedDate || ''
      }
    }
  } catch (error) {
    console.log('Google Books API 获取失败')
  }
  
  return null
}

/**
 * 从开放图书馆 API 获取图书信息
 */
async function fetchFromOpenLibrary(isbn) {
  try {
    const response = await wx.request({
      url: `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
      method: 'GET'
    })

    if (response.statusCode === 200 && response.data) {
      const bookKey = `ISBN:${isbn}`
      const bookInfo = response.data[bookKey]
      
      if (bookInfo) {
        return {
          title: bookInfo.title || '',
          author: bookInfo.authors?.map(a => a.name).join(', ') || '',
          publisher: bookInfo.publishers?.[0]?.name || '',
          isbn: isbn,
          cover: bookInfo.cover?.medium || bookInfo.cover?.large || '',
          pubdate: bookInfo.publish_date || ''
        }
      }
    }
  } catch (error) {
    console.log('开放图书馆 API 获取失败')
  }
  
  return null
}

/**
 * 搜索图书
 * @param {string} keyword - 搜索关键词
 * @returns {Promise<Array>} 图书列表
 */
async function searchBooks(keyword) {
  try {
    const response = await wx.request({
      url: `${GOOGLE_BOOKS_API_BASE}/volumes?q=${encodeURIComponent(keyword)}&maxResults=20`,
      method: 'GET'
    })

    if (response.statusCode === 200 && response.data.totalItems > 0) {
      return response.data.items.map(item => {
        const book = item.volumeInfo
        return {
          title: book.title,
          author: book.authors?.join(', ') || '',
          publisher: book.publisher || '',
          isbn: book.industryIdentifiers?.[0]?.identifier || '',
          cover: book.imageLinks?.thumbnail || '',
          summary: book.description || ''
        }
      })
    }
    
    return []
  } catch (error) {
    console.error('搜索图书失败:', error)
    return []
  }
}

module.exports = {
  getBookByISBN,
  searchBooks
}
