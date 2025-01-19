import crypto from 'crypto';
import Users from '../../../models/schemas/User.js';
import generateToken from '../../../modules/generateToken.js';

/**
 * Fetches user profile data based on the provided user ID
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Object} - User profile data.
 */
const retrieveUserProfile = async (req, res, next) => {
  const key = req.headers.key;
  // Check for valid access key in headers
  if (!key || key !== process.env.ACCESS_KEY) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }
  const user = await Users.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' }); // User not found
  }

  // This will return the data however it won't be the latest one after updating the token
  return res.status(200).json(user);
};

/**
 * Processes user actions such as addquota, removequota, updaterole, and banuser
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Object} - Response with action results or errors.
 */
const processUserAction = async (req, res, next) => {
  const key = req.headers.key;

  // Check for valid access key in headers
  if (!key || key !== process.env.ACCESS_KEY) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  const userId = req.params.id;
  const { action, amount, reason, executor, expiry } = req.body; // Extract fields from the request body

  try {
    // Fetch user by ID
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); // User not found
    }

    let updatedUser;

    // Handle different actions
    switch (action) {
      case 'addquota':
        if (!amount || amount <= 0) {
          return res.status(400).json({ message: 'Invalid quota amount' });
        }
        user.req_quota = (user.req_quota || 0) + Number(amount);

        // Update status history
        user.status_history.push({
          _id: user.status_history.length + 1,
          timestamp: new Date(),
          reason: reason || 'Quota added',
          value: `+${amount} quota`,
          executor: executor || 'system',
        });

        updatedUser = await user.save();
        break;

      case 'removequota':
        if (!amount || amount <= 0) {
          return res.status(400).json({ message: 'Invalid quota amount' });
        }
        if ((user.req_quota || 0) < amount) {
          return res.status(400).json({ message: 'Insufficient quota' });
        }
        user.req_quota = (user.req_quota || 0) - Number(amount);

        // Update status history
        user.status_history.push({
          _id: user.status_history.length + 1,
          timestamp: new Date(),
          reason: reason || 'Quota removed',
          value: `-${amount} quota`,
          executor: executor || 'system',
        });

        updatedUser = await user.save();
        break;

      case 'ban':
        if (!reason) {
          return res.status(400).json({ message: 'Ban reason is required' });
        }
        user.banned = true;

        // Update status history
        user.status_history.push({
          _id: user.status_history.length + 1,
          timestamp: new Date(),
          expiry: expiry || null,
          reason,
          isBanned: true,
          executor: executor || 'system',
        });

        updatedUser = await user.save();
        break;
      case 'unban':
        if (!reason) {
          return res.status(400).json({ message: 'Unban reason is required' });
        }
        user.banned = false;

        // Update status history
        user.status_history.push({
          _id: user.status_history.length + 1,
          timestamp: new Date(),
          expiry: expiry || null,
          reason,
          isBanned: false,
          executor: executor || 'system',
        });

        updatedUser = await user.save();
        break;

      case 'updatetoken':
        if (!reason) {
          return res.status(400).json({ message: 'Token update reason is required' });
        }
        const token = generateToken(userId, process.env.HMAC_KEY);
        user.token = token;

        // Update status history
        user.status_history.push({
          _id: user.status_history.length + 1,
          timestamp: new Date(),
          reason: reason || 'Token updated',
          value: token,
          executor: executor || 'system',
        });

        updatedUser = await user.save();
        break;

      default:
        return res.status(400).json({ message: `Invalid action: ${action}` });
    }

    // Respond with updated user data
    return res.status(200).json({
      success: true,
      message: `${action} executed successfully`,
      user: updatedUser,
    });
  } catch (error) {
    // Handle server errors
    return res.status(500).json({
      message: 'An error occurred while processing the action',
      error: error.message,
    });
  }
};

/**
 * Processes user session by creating a new user if one doesn't exist,
 * updating tokens if applicable, and handling authentication.
 *
 * @param {Object} req - Express request object containing headers and body.
 * @param {Object} res - Express response object for sending responses.
 * @param {Function} next - Express next middleware function for error handling.
 * @returns {Object} - JSON response indicating success or failure.
 */
const processUserSessionAndUpdate = async (req, res, next) => {
  try {
    const { headers, body } = req;
    const { token, id, email, 'access-token': access_token } = body;
    const { key } = headers;

    // Validate access key
    if (!key || key !== process.env.ACCESS_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate User ID
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if the user exists
    const existingUser = await Users.findOne({ _id: id });

    if (!existingUser) {
      // If the user doesn't exist, ensure required fields are provided
      if (!email || !access_token) {
        return res.status(400).json({
          message: 'Email and access-token are required for new users',
        });
      }

      // Create a new user with a generated token
      const generatedToken = generateToken(id, process.env.HMAC_KEY);
      const newUser = {
        _id: id,
        email,
        token: generatedToken,
        access_token,
        password: crypto.randomBytes(22).toString('base64'), // Generate a random password
      };

      await Users.create(newUser);

      return res.status(201).json({
        message: 'User created successfully',
        token: newUser.token,
      });
    } else {
      // If the user exists, update the token if provided, and access-token if available
      const updates = {};
      if (token) updates.token = token;
      if (access_token) updates.access_token = access_token;

      if (Object.keys(updates).length > 0) {
        await Users.updateOne({ _id: id }, { $set: updates });
      }

      if (token) {
        return res.status(200).json({ message: 'Token updated successfully', token: token });
      } else {
        return res.status(200).json({ message: 'Logging successfully', token: existingUser.token });
      }
    }
  } catch (error) {
    console.error('Error in processUserSessionAndUpdate :', error.message);
    return next(error);
  }
};

/**
 * Fetches user data by ID, validates the access key, and updates the access token if provided.
 *
 * @param {Object} req - Express request object containing headers.
 * @param {Object} res - Express response object for sending responses.
 * @param {Function} next - Express next middleware function for error handling.
 * @returns {Object} - JSON response with user token or error message.
 */
const getUser = async (req, res, next) => {
  try {
    const { headers } = req;
    const { key } = headers;

    // Validate access key
    if (!key || key !== process.env.ACCESS_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id, email, 'access-token': access_token } = headers;

    // Validate User ID
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find user by ID
    const user = await Users.findOne({ _id: id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's access token
    if (access_token) {
      await Users.updateOne({ _id: id }, { $set: { access_token } });
    }

    return res.status(200).json({ token: user.token });
  } catch (error) {
    console.error('Error in getUser:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export { retrieveUserProfile, updateUserToken, processUserAction, processUserSessionAndUpdate, getUser };
