import logging
from logging.handlers import RotatingFileHandler
import os
import sys

LOG_DIR = "logs"
APP_LOG_FILE = "app.log"

LOG_LEVEL = logging.INFO

LOG_FORMAT = (
    "%(asctime)s | "
    "%(levelname)s | "
    "%(name)s | "
    "req_id=%(request_id)s | "
    "user_id=%(user_id)s | "
    "%(message)s"
)

DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


class ContextFilter(logging.Filter):
    def filter(self, record):
        if not hasattr(record, 'request_id'):
            record.request_id = '-'
        if not hasattr(record, 'user_id'):
            record.user_id = '-'
        if not hasattr(record, 'ip'):
            record.ip = '-'
        if not hasattr(record, 'user_agent'):
            record.user_agent = '-'
        if not hasattr(record, 'role'):
            record.role = '-'
        return True


def setup_logging() -> None:
    os.makedirs(LOG_DIR, exist_ok=True)

    log_path = os.path.join(LOG_DIR, APP_LOG_FILE)

    root_logger = logging.getLogger()
    if root_logger.handlers:
        return

    root_logger.setLevel(LOG_LEVEL)
    root_logger.addFilter(ContextFilter())

    file_handler = RotatingFileHandler(
        log_path,
        maxBytes=10 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8",
    )
    file_handler.setFormatter(logging.Formatter(LOG_FORMAT, DATE_FORMAT))
    file_handler.setLevel(LOG_LEVEL)
    file_handler.addFilter(ContextFilter())

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(logging.Formatter(LOG_FORMAT, DATE_FORMAT))
    console_handler.setLevel(LOG_LEVEL)
    console_handler.addFilter(ContextFilter())

    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)

    _silence_noisy_loggers()


def _silence_noisy_loggers() -> None:
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)

    logging.getLogger("mysql.connector").setLevel(logging.WARNING)
    logging.getLogger("python_multipart").setLevel(logging.ERROR)

    logging.getLogger("passlib").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)
