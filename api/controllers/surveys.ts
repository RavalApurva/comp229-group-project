import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { ProfessorModel, UserModel } from '../models/Survey';

const createProfessor = async (req: Request, res: Response) => {
  try {
    const newProfessor = {
      name: req.body.name,
      ratings: []
    }
    const professorName = { name: req.body.name };


    const existingProfessor = await ProfessorModel.findOne(professorName);

    if (existingProfessor) {
      return res.status(409).json({ error: 'Professor already exists' });
    }

    const professor = await ProfessorModel.create(newProfessor);

    res.status(201).json(professor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllProfessors = async (req: Request, res: Response) => {
  try {
    const professors = await ProfessorModel.find();
    res.json(professors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProfessorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const professor = await ProfessorModel.findById(id);

    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    res.json(professor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProfessorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, ratings } = req.body;

    const updatedProfessor = await ProfessorModel.findByIdAndUpdate(
      id,
      { name, ratings },
      { new: true }
    );

    if (!updatedProfessor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    res.json(updatedProfessor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteProfessorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedProfessor = await ProfessorModel.findByIdAndDelete(id);

    if (!deletedProfessor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    res.json(deletedProfessor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addRatingToProfessor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (rating !== 'recommended' && rating !== 'not recommended') {
      return res.status(400).json({ error: 'Invalid rating. Use either "recommended" or "not recommended"' });
    }

    const professor = await ProfessorModel.findById(id);

    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    professor.ratings.push(rating);

    await professor.save();

    res.status(200).json(professor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteRatingFromProfessor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { index } = req.body;

    const professor = await ProfessorModel.findById(id);

    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    if (index === undefined || index === null) {
      professor.ratings.pop();
    } else {
      const ratingIndex = parseInt(index, 10);
      if (isNaN(ratingIndex) || ratingIndex < 0 || ratingIndex >= professor.ratings.length) {
        return res.status(400).json({ error: 'Invalid rating index' });
      }

      professor.ratings.splice(ratingIndex, 1);
    }

    await professor.save();

    res.status(200).json(professor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createUser = async (req: Request, res: Response) => {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = {
      username: req.body.username,
      password: hashedPassword
    }
    const existingUser = await UserModel.findOne(newUser);

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = await UserModel.create(newUser);

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body
    const attemptedUser = { username }

    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(attemptedUser, process.env.ACCESS_TOKEN_SECRET);
    res.status(200).json({ accessToken: accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default {
  createProfessor,
  getAllProfessors,
  getProfessorById,
  updateProfessorById,
  deleteProfessorById,
  addRatingToProfessor,
  deleteRatingFromProfessor,
  createUser,
  getAllUsers,
  loginUser,
};
