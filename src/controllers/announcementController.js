const announcementModel = require('../models/announcementModel');
const logger = require('../logger');

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

        logger.info(
            `ANNOUNCEMENTS_FETCH | user=${req.session.user?.id} | ip=${req.ip}`,
        );

        return res.render('announcement', {
            title: 'Announcements',
            announcements: updatedAnnouncements,
            isAdmin
        });
    } catch (err) {
        logger.error(
            `ANNOUNCEMENTS_FETCH_ERROR | user=${req.session.user?.id} | ip=${req.ip} | isAdmin=${isAdmin} | error=${err}`,
        );
        const isDev = process.env.NODE_ENV === 'development';
        return res.render('error', {
            title: 'Server Error',
            message: isDev ? (err?.stack || String(err)) : 'Server error.',
            noNavbar: true
        });
    }
};

exports.showCreateAnnouncement = async (req, res) => {
    try {
        logger.info(
            `ANNOUNCEMENTS_CREATE_VIEW | admin=${req.session.user?.id} | ip=${req.ip}`,
        );
        return res.render('editAnnouncement', {
            title: 'Create Announcement'
        });
    } catch (err) {
        logger.error(
            `ANNOUNCEMENTS_CREATE_VIEW_ERROR | admin=${req.session.user?.id} | ip=${req.ip} | error=${err}`,
        );
        const isDev = process.env.NODE_ENV === 'development';
        return res.render('error', {
            title: 'Server Error',
            message: isDev ? (err?.stack || String(err)) : 'Server error.',
            noNavbar: true
        });
    }
};

exports.showEditAnnouncement = async (req, res) => {
    const id = req.params.announcementId;

    try {
        const announcement = await announcementModel.getAnnouncementByID(id);

        if (!announcement) {
            return res.render('error', {
                title: 'Announcement not found', message: 'Announcement not found.'
            });
        }

        logger.info(
            `ANNOUNCEMENTS_UPDATE_VIEW | admin=${req.session.user?.id} | ip=${req.ip}`,
        );
        return res.render('editAnnouncement', {
            title: 'Edit Announcement',
            announcement
        });
    } catch (err) {
        logger.error(
            `ANNOUNCEMENTS_UPDATE_VIEW_ERROR | admin=${req.session.user?.id} | ip=${req.ip} | announcementId=${id} | error=${err}`,
        );
        const isDev = process.env.NODE_ENV === 'development';
        return res.render('error', {
            title: 'Server Error',
            message: isDev ? (err?.stack || String(err)) : 'Server error.',
            noNavbar: true
        });
    }
};

exports.createAnnouncement = async (req, res) => {
    const { title, content } = req.body;
    const user_id = req.session.user.id;

    try {
        await announcementModel.createAnnouncement(title, content, user_id);

        logger.info(
            `ANNOUNCEMENTS_CREATE | admin=${req.session.user?.id} | ip=${req.ip}`,
        );
        return res.redirect('/announcement');
    } catch (err) {
        logger.error(
            `ANNOUNCEMENTS_CREATE_ERROR | admin=${req.session.user?.id} | ip=${req.ip} | error=${err}`,
        );
        const isDev = process.env.NODE_ENV === 'development';
        return res.render('error', {
            title: 'Server Error',
            message: isDev ? (err?.stack || String(err)) : 'Server error.',
            noNavbar: true
        });
    }
};

exports.updateAnnouncement = async (req, res) => {
    const { title, content } = req.body;
    const id = req.params.announcementId;
    const user_id = req.session.user.id;

    try {
        await announcementModel.updateAnnouncement(id, title, content, user_id);

        logger.info(
            `ANNOUNCEMENTS_UPDATE | admin=${req.session.user?.id} | ip=${req.ip}`,
        );

        return res.redirect('/announcement');
    } catch (err) {
        logger.error(
            `ANNOUNCEMENTS_UPDATE_ERROR | admin=${req.session.user?.id} | ip=${req.ip} | announcementId=${id} | error=${err}`,
        );
        const isDev = process.env.NODE_ENV === 'development';
        return res.render('error', {
            title: 'Server Error',
            message: isDev ? (err?.stack || String(err)) : 'Server error.',
            noNavbar: true
        });
    }
};

exports.deleteAnnouncement = async (req, res) => {
    const id = req.params.announcementId;

    try {
        await announcementModel.deleteAnnouncement(id);

        logger.info(
            `ANNOUNCEMENTS_DELETE | admin=${req.session.user?.id} | ip=${req.ip}`,
        );

        return res.redirect('/announcement');
    } catch (err) {
        logger.error(
            `ANNOUNCEMENTS_DELETE_ERROR | admin=${req.session.user?.id} | ip=${req.ip} | announcementId=${id} | error=${err}`,
        );
        const isDev = process.env.NODE_ENV === 'development';
        return res.render('error', {
            title: 'Server Error',
            message: isDev ? (err?.stack || String(err)) : 'Server error.',
            noNavbar: true
        });
    }
};