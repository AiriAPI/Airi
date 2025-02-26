import System from '../../../models/schemas/System.js';

/**
 * Fetches the status of a specific page (availability & maintenance status).
 */
export const getPageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const key = req.headers.key;

    // Check for valid access key in headers
    if (!key || key !== process.env.ACCESS_KEY) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const system = await System.findOne({ 'pages._id': id }, { 'pages.$': 1 });

    if (!system || !system.pages.length) {
      return res.status(404).json({ message: 'Page not found' });
    }

    const page = system.pages[0];

    return res.status(200).json({
      _id: page._id,
      available: page.available,
      maintenance: page.maintenance,
    });
  } catch (error) {
    console.error('Error fetching page status:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Retrieves metadata, including permissions and maintenance info.
 */
export const getPageMeta = async (req, res) => {
  try {
    const { id } = req.params;
    const key = req.headers.key;

    // Check for valid access key in headers
    if (!key || key !== process.env.ACCESS_KEY) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const system = await System.findOne({ 'pages._id': id }, { 'pages.$': 1 });

    if (!system || !system.pages.length) {
      return res.status(404).json({ message: 'Page not found' });
    }

    const page = system.pages[0];

    return res.status(200).json({
      _id: page._id,
      type: page.type,
      maintenance: page.maintenance,
      permission: page.permission,
    });
  } catch (error) {
    console.error('Error fetching page metadata:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Checks if the user has permission to access the page.
 */
export const checkPageAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.query; // User role should be passed as a query param
    const key = req.headers.key;

    // Check for valid access key in headers
    if (!key || key !== process.env.ACCESS_KEY) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const system = await System.findOne({ 'pages._id': id }, { 'pages.$': 1 });

    if (!system || !system.pages.length) {
      return res.status(404).json({ message: 'Page not found' });
    }

    const page = system.pages[0];

    if (!role) {
      return res.status(200).json({ _id: page._id, permissions: page.permission });
    }

    const hasAccess = page.permission.roles.includes('guest') || page.permission.roles.includes(role);

    return res.status(200).json({ _id: page._id, access: hasAccess });
  } catch (error) {
    console.error('Error checking page access:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Returns general page details, including type, status, and permissions.
 */
export const getPageInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const key = req.headers.key;

    // Check for valid access key in headers
    if (!key || key !== process.env.ACCESS_KEY) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const system = await System.findOne({ 'pages._id': id }, { 'pages.$': 1 });

    if (!system || !system.pages.length) {
      return res.status(404).json({ message: 'Page not found' });
    }

    const page = system.pages[0];

    return res.status(200).json(page);
  } catch (error) {
    console.error('Error fetching page info:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Updates page details (availability, type, maintenance, or permissions).
 */
export const updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { available, type, maintenance, permission } = req.body;
    const key = req.headers.key;

    // Check for valid access key in headers
    if (!key || key !== process.env.ACCESS_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate input
    if (type && !['production', 'alpha', 'beta'].includes(type)) {
      return res.status(400).json({ message: 'Invalid page type' });
    }

    const updateFields = {};
    if (available !== undefined) updateFields['pages.$.available'] = available;
    if (type) updateFields['pages.$.type'] = type;

    // Merge `maintenance` fields instead of replacing
    if (maintenance) {
      Object.keys(maintenance).forEach(key => {
        updateFields[`pages.$.maintenance.${key}`] = maintenance[key];
      });
    }

    // Merge `permission` fields instead of replacing
    if (permission) {
      Object.keys(permission).forEach(key => {
        updateFields[`pages.$.permission.${key}`] = permission[key];
      });
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    // Update the document without projection to avoid MongoDB error
    await System.findOneAndUpdate({ 'pages._id': id }, { $set: updateFields });

    // Fetch the updated page separately
    const updatedSystem = await System.findOne({ 'pages._id': id }, { pages: { $elemMatch: { _id: id } } });

    if (!updatedSystem || !updatedSystem.pages.length) {
      return res.status(404).json({ message: 'Page not found' });
    }

    return res.status(200).json({
      message: 'Page updated successfully',
      page: updatedSystem.pages[0],
    });
  } catch (error) {
    console.error('Error updating page:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Middleware to add page details
 */
export const addPage = async (req, res, next) => {
  try {
    const { name, available, type, maintenance, permission } = req.body;
    const key = req.headers.key;

    // Check for valid access key in headers
    if (!key || key !== process.env.ACCESS_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate input
    if (!name) {
      return res.status(400).json({ message: 'Page name is required' });
    }

    if (type && !['production', 'alpha', 'beta'].includes(type)) {
      return res.status(400).json({ message: 'Invalid page type' });
    }

    const newPage = {
      _id: name,
      available: available ?? true, // Default to true if not provided
      type: type || 'production',
      maintenance: maintenance || {},
      permission: permission || {},
    };

    const updatedSystem = await System.findOneAndUpdate(
      {},
      { $push: { pages: newPage } },
      { new: true, projection: { pages: 1 } },
    );

    if (!updatedSystem) {
      return res.status(500).json({ message: 'Failed to add page' });
    }

    return res.status(201).json({
      message: 'Page added successfully',
      page: newPage,
    });
  } catch (error) {
    console.error('Error adding page:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
