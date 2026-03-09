/**
 * 图书信息 API 工具类
 * 使用免费的第三方 API 获取图书信息
 */

// ISBN查询接口（已测试可用）
const ISBN_API_BASE = 'http://data.isbn.work/openApi/getInfoByIsbn'
const ISBN_API_KEY = 'ae1718d4587744b0b79f940fbef69e77'

const DOUBAN_API_BASE = 'https://api.douban.com'
const GOOGLE_BOOKS_API_BASE = 'https://www.googleapis.com/books/v1'

/**
 * 通过 ISBN 获取图书信息
 * @param {string} isbn - ISBN 条形码
 * @returns {Promise<Object>} 图书信息对象
 */
async function getBookByISBN(isbn) {
  try {
    // 方案 1: 使用国内免费 ISBN 接口（推荐，已测试可用）
    const isbnResult = await fetchFromISBNAPI(isbn)
    if (isbnResult && isbnResult.bookName) {
      return isbnResult
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
 * 从国内免费 ISBN API 获取图书信息（推荐）
 */
async function fetchFromISBNAPI(isbn) {
  try {
    console.log('开始请求 ISBN API:', isbn)
    
    const response = await wx.request({
      url: ISBN_API_BASE,
      data: {
        isbn: isbn,
        appKey: ISBN_API_KEY
      },
      method: 'GET',
      success: (res) => {
        console.log('✓ 请求成功，statusCode:', res.statusCode)
        console.log('返回数据:', res.data)
      },
      fail: (err) => {
        console.error('✗ 请求失败:', err.errMsg)
        console.error('完整错误:', err)
        // 抛出错误让上层捕获
        throw new Error('网络请求失败：' + err.errMsg)
      }
    })

    console.log('response:', response)

    if (response && response.statusCode === 200 && response.data) {
      const result = response.data
      
      if (result.code === 0 && result.data) {
        const book = result.data
        const pictures = book.pictures ? JSON.parse(book.pictures) : []
        
        return {
          title: book.bookName || '',
          author: book.author || '',
          publisher: book.press || '',
          isbn: book.isbn || isbn,
          cover: pictures[0] || '',
          summary: book.bookDesc || '',
          price: book.price ? (book.price / 100).toFixed(2) : '',
          pages: book.pages || '',
          pubdate: book.pressDate || '',
          binding: book.binding || '',
          language: book.language || ''
        }
      } else {
        console.log('API 返回错误 code:', result.code)
      }
    }
  } catch (error) {
    console.error('ISBN API 异常:', error.message || error)
    console.log('请检查：1.域名是否已配置 2.网络是否正常')
  }
  
  return null
}

/**
 * 从豆瓣API 获取图书信息
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
