const subChipModel = require('../models/subChipModel');
const postModel = require('../models/postModel');

exports.getAllSubChips = async (req, res) => {
    try {
        const isAdmin = req.session.user && req.session.user.role === 'admin';
        const subChips = await subChipModel.getAllSubChips();
        const updatedsubChips = subChips.map(subChip => ({
            ...subChip,
            datetime: new Date(subChip.created_at).toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        }));
        return res.render('chip', { 
            title: 'Chips', 
            subChips: updatedsubChips,
            isAdmin
        });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.showCreateSubChipForm = async (req, res) => {
    try {
        return res.render('editSubChip', { 
            title: 'Create SubChip', 
            subChip: {} 
        });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.showEditSubChipForm = async (req, res) => {
    const id = req.params.subChipId;

    try {
        const subChip = await subChipModel.getSubChipByID(id);

        if (!subChip) {
            return res.send('SubChip not found');
        }

        return res.render('editSubChip', { 
            title: 'Edit SubChip', 
            subChip 
        });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.createSubChip = async (req, res) => {
    const { title, description } = req.body;

    try {
        const subChipAlreadyExists = await subChipModel.subChipExists(title);
        if (subChipAlreadyExists) {
            req.session.errorMessage = 'SubChip already exists';
            return res.redirect('/chip/create');
        }

        await subChipModel.createSubChip(title, description);
        return res.redirect('/chip');
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.updateSubChip = async (req, res) => {
    const { title, description } = req.body;
    const id = req.params.subChipId;

    try {
        const subChipAlreadyExists = await subChipModel.subChipExists(title);
        if (subChipAlreadyExists) {
            req.session.errorMessage = 'SubChip already exists';
            return res.redirect('/chip/create');
        }

        await subChipModel.updateSubChip(id, title, description);
        return res.redirect('/chip');
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.deleteSubChip = async (req, res) => {
    const id = req.params.subChipId;

    try {
        await postModel.deletePostsBySubChip(id);
        await subChipModel.deleteSubChip(id);

        return res.redirect('/chip');
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};