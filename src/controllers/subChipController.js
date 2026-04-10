const subChipModel = require('../models/subChipModel');
const logger = require('../logger');

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
        logger.info(
            `SUBCHIPS_FETCH | user=${req.session.user?.id} | ip=${req.ip}`,
        );
        return res.render('chip', {
            title: 'Chips',
            subChips: updatedsubChips,
            isAdmin
        });
    } catch (err) {
        logger.info(
            `SUBCHIPS_FETCH_ERROR | user=${req.session.user?.id} | ip=${req.ip} | error=${err.stack || err}`,
        );
        const isDev = process.env.NODE_ENV === 'development';
        return res.render('error', {
            title: 'Server Error',
            message: isDev ? (err?.stack || String(err)) : 'Server error.',
            noNavbar: true
        });
    }
};

exports.showCreateSubChipForm = async (req, res) => {
    try {
        logger.info(
            `SUBCHIP_CREATE_VIEW | user=${req.session.user?.id} | ip=${req.ip}`,
        );
        return res.render('editSubChip', {
            title: 'Create SubChip'
        });
    } catch (err) {
        logger.info(
            `SUBCHIP_CREATE_VIEW_ERROR | user=${req.session.user?.id} | ip=${req.ip} | error=${err.stack || err}`,
        );
        const isDev = process.env.NODE_ENV === 'development';
        return res.render('error', {
            title: 'Server Error',
            message: isDev ? (err?.stack || String(err)) : 'Server error.',
            noNavbar: true
        });
    }
};

exports.showEditSubChipForm = async (req, res) => {
    const id = req.params.subChipId;

    try {
        const subChip = await subChipModel.getSubChipByID(id);

        if (!subChip) {
            return res.render('error', {
                title: 'SubChip not found', message: 'SubChip not found.'
            });
        }
        logger.info(
            `SUBCHIP_UPDATE_VIEW | user=${req.session.user?.id} | ip=${req.ip} | subChipId=${id}`,
        );
        return res.render('editSubChip', {
            title: 'Edit SubChip',
            subChip
        });
    } catch (err) {
        logger.info(
            `SUBCHIP_UPDATE_VIEW_ERROR | user=${req.session.user?.id} | ip=${req.ip} | subChipId=${id} | error=${err.stack || err}`,
        );
        const isDev = process.env.NODE_ENV === 'development';
        return res.render('error', {
            title: 'Server Error',
            message: isDev ? (err?.stack || String(err)) : 'Server error.',
            noNavbar: true
        });
    }
};

exports.createSubChip = async (req, res) => {
    const { title, description } = req.body;

    try {
        const subChipAlreadyExists = await subChipModel.subChipExists(title);
        if (subChipAlreadyExists) {
            logger.warn(
                `SUBCHIP_CREATE_FAIL | user=${req.session.user?.id} | reason=duplicate | ip=${req.ip}`,
            );
            req.session.errorMessage = 'SubChip already exists';
            return res.redirect('/chip/create');
        }

        await subChipModel.createSubChip(title, description);
        logger.info(
            `SUBCHIP_CREATE | user=${req.session.user?.id} | ip=${req.ip}`,
        );
        return res.redirect('/chip');
    } catch (err) {

        logger.info(
            `SUBCHIP_CREATE_ERROR | user=${req.session.user?.id} | ip=${req.ip} | error=${err.stack || err}`,
        );
        const isDev = process.env.NODE_ENV === 'development';
        return res.render('error', {
            title: 'Server Error',
            message: isDev ? (err?.stack || String(err)) : 'Server error.',
            noNavbar: true
        });
    }
};

exports.updateSubChip = async (req, res) => {
    const { title, description } = req.body;
    const id = req.params.subChipId;

    try {
        const subChipAlreadyExists = await subChipModel.subChipExists(title);
        if (subChipAlreadyExists) {
            logger.warn(
                `SUBCHIP_UPDATE_FAIL | user=${req.session.user?.id} | reason=duplicate | ip=${req.ip} | subChipId=${id}`,
            );
            req.session.errorMessage = 'SubChip already exists';
            return res.redirect('/chip/create');
        }

        await subChipModel.updateSubChip(id, title, description);
        logger.info(
            `SUBCHIP_UPDATE | user=${req.session.user?.id} | ip=${req.ip} | subChipId=${id}`,
        );
        return res.redirect('/chip');
    } catch (err) {
        logger.error(
            `SUBCHIP_UPDATE_ERROR | user=${req.session.user?.id} | ip=${req.ip} | subChipId=${id} | error=${err.stack || err}`,
        );
        const isDev = process.env.NODE_ENV === 'development';
        return res.render('error', {
            title: 'Server Error',
            message: isDev ? (err?.stack || String(err)) : 'Server error.',
            noNavbar: true
        });
    }
};

exports.deleteSubChip = async (req, res) => {
    const id = req.params.subChipId;

    try {
        await subChipModel.deleteSubChip(id);
        logger.info(
            `SUBCHIP_DELETE | user=${req.session.user?.id} | ip=${req.ip} | subChipId=${id}`,
        );
        return res.redirect('/chip');
    } catch (err) {
        logger.info(
            `SUBCHIP_DELETE_ERROR | user=${req.session.user?.id} | ip=${req.ip} | subChipId=${id} | error=${err.stack || err}`,
        );
        const isDev = process.env.NODE_ENV === 'development';
        return res.render('error', {
            title: 'Server Error',
            message: isDev ? (err?.stack || String(err)) : 'Server error.',
            noNavbar: true
        });
    }
};