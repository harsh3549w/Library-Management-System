import InventoryIssue from '../models/inventoryIssueModel.js'
import { Book } from '../models/bookModel.js'

// Create a new missing/stolen issue
export const createInventoryIssue = async (req, res, next) => {
  try {
    const { bookRef, status, note } = req.body
    if (!bookRef || !status) {
      return res.status(400).json({ success: false, message: 'bookRef and status are required' })
    }
    if (!['missing', 'stolen'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    // Resolve book by ISBN or title or id
    const bookQuery = {
      $or: [
        { isbn: bookRef },
        { title: new RegExp(`^${bookRef}$`, 'i') },
      ]
    }

    let book = await Book.findOne(bookQuery)
    if (!book) {
      // Try by id
      if (bookRef.match(/^[0-9a-fA-F]{24}$/)) {
        book = await Book.findById(bookRef)
      }
    }
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' })
    }

    const issue = await InventoryIssue.create({
      book: book._id,
      status,
      note: note || '',
      reportedBy: req.user._id,
    })

    const populated = await InventoryIssue.findById(issue._id)
      .populate('book', 'title isbn authors')
      .populate('reportedBy', 'name email')

    return res.status(201).json({ success: true, message: 'Issue recorded', issue: populated })
  } catch (err) {
    next(err)
  }
}

// List issues (optionally filter by status/active)
export const listInventoryIssues = async (req, res, next) => {
  try {
    const { status, active } = req.query
    const filter = {}
    if (status && ['missing', 'stolen'].includes(status)) filter.status = status
    if (active === 'true') filter.resolved = false
    if (active === 'false') filter.resolved = true

    const issues = await InventoryIssue.find(filter)
      .sort({ createdAt: -1 })
      .populate('book', 'title isbn authors')
      .populate('reportedBy', 'name email')
      .populate('resolvedBy', 'name email')

    return res.status(200).json({ success: true, issues })
  } catch (err) {
    next(err)
  }
}

// Resolve an issue
export const resolveInventoryIssue = async (req, res, next) => {
  try {
    const { id } = req.params
    const issue = await InventoryIssue.findById(id)
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' })
    if (issue.resolved) return res.status(400).json({ success: false, message: 'Issue already resolved' })

    issue.resolved = true
    issue.resolvedAt = new Date()
    issue.resolvedBy = req.user._id
    await issue.save()

    return res.status(200).json({ success: true, message: 'Issue marked as resolved' })
  } catch (err) {
    next(err)
  }
}
