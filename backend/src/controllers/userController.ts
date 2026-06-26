import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { name, email, avatar } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const updateData: any = {};

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== user.email.toLowerCase()) {
        const existingUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (existingUser) {
          res.status(400).json({ message: 'Email address is already in use by another user' });
          return;
        }
        updateData.email = normalizedEmail;
      }
    }

    if (name) updateData.name = name.trim();
    if (avatar) updateData.avatar = avatar;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    res.status(200).json({
      id: updatedUser.id,
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
    });
  } catch (error: any) {
    console.error('updateProfile error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Current password and new password are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Incorrect current password' });
      return;
    }

    // Hash the new password manually since we are using Prisma
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('changePassword error:', error);
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};
