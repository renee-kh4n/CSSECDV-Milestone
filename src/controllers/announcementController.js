const announcementModel = require('../models/announcementModel');

exports.getAllAnnouncements = async (req, res) => {
    try {
        const isAdmin = req.session.user && req.session.user.role === 'admin';
        const announcements = await announcementModel.getAllAnnouncements();

        const updatedAnnouncements = announcements.map(announcement => ({
            ...announcement,
            datetime: new Date(announcement.created_at).toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        }));

        return res.render('announcement', {
            title: 'Announcements',
            announcements: updatedAnnouncements,
            isAdmin
        });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.showCreateAnnouncement = async (req, res) => {
    try {
        return res.render('editAnnouncement', {
            title: 'Create Announcement',
            announcement: {}
        });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.showEditAnnouncement = async (req, res) => {
    const id = req.params.announcementId;

    try {
        const announcement = await announcementModel.getAnnouncementByID(id);

        if (!announcement) {
            return res.send('Announcement not found');
        }

        return res.render('editAnnouncement', {
            title: 'Edit Announcement',
            announcement
        });
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.createAnnouncement = async (req, res) => {
    const { title, content } = req.body;
    const user_id = req.session.user.id;

    try {
        await announcementModel.createAnnouncement(title, content, user_id);
        return res.redirect('/announcement');
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.updateAnnouncement = async (req, res) => {
    const { title, content } = req.body;
    const id = req.params.announcementId;
    const user_id = req.session.user.id;

    try {
        await announcementModel.updateAnnouncement(id, title, content, user_id);
        return res.redirect('/announcement');
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};

exports.deleteAnnouncement = async (req, res) => {
    const id = req.params.announcementId;

    try {
        await announcementModel.deleteAnnouncement(id);
        return res.redirect('/announcement');
    } catch (err) {
        console.error(err);
        return res.send('Server error');
    }
};