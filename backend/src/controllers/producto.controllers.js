const productoService = require('../services/producto.services');

class ProductoController {
  async obtenerProductos(req, res) {
    try {
      const { busqueda } = req.query;
      const productos = await productoService.obtenerProductos(busqueda);
      return res.json(productos);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async obtenerProductoPorId(req, res) {
    try {
      const { id } = req.params;
      const producto = await productoService.obtenerProductoPorId(id);
      return res.json(producto);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  }

  async obtenerCategorias(req, res) {
    try {
      const categorias = await productoService.obtenerCategorias();
      return res.json(categorias);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async crearProducto(req, res) {
    try {
      const resultado = await productoService.crearProducto(req.body);
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async actualizarProducto(req, res) {
    try {
      const { id } = req.params;
      const resultado = await productoService.actualizarProducto(id, req.body);
      return res.json(resultado);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async eliminarProducto(req, res) {
    try {
      const { id } = req.params;
      const resultado = await productoService.eliminarProducto(id);
      return res.json(resultado);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async generarCodigo(req, res) {
    try {
      const { nombre } = req.query;
      const codigo = await productoService.generarSiguienteCodigo(nombre);
      return res.json({ codigo });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ProductoController();
